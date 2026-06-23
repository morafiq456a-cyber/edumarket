const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');

exports.createCourse = async (req, res) => {
    try {
        req.body.instructor = req.user.id;
        const course = await Course.create(req.body);
        res.status(201).json({
            success: true,
            message: 'تم إنشاء الكورس 📚',
            data: course
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        let query = { status: 'published' };

        if (req.query.category) query.category = req.query.category;
        if (req.query.level) query.level = req.query.level;
        if (req.query.isFree === 'true') query.isFree = true;
        if (req.query.search) query.title = { $regex: req.query.search, $options: 'i' };

        let sortBy = '-createdAt';
        if (req.query.sort === 'price-low') sortBy = 'price';
        if (req.query.sort === 'price-high') sortBy = '-price';
        if (req.query.sort === 'rating') sortBy = '-averageRating';
        if (req.query.sort === 'popular') sortBy = '-totalStudents';

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const courses = await Course.find(query)
            .populate('instructor', 'firstName lastName avatar')
            .populate('category', 'name')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: courses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'firstName lastName avatar bio headline')
            .populate('category', 'name');

        if (!course) {
            return res.status(404).json({ success: false, message: 'الكورس غير موجود' });
        }

        const lessons = await Lesson.find({ course: course._id })
            .sort('order')
            .select('title duration isFreePreview order section');

        res.status(200).json({
            success: true,
            data: { course, lessons, totalLessons: lessons.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'غير موجود' });

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'غير مصرح' });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'تم التحديث ✅', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'غير موجود' });

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'غير مصرح' });
        }

        await Lesson.deleteMany({ course: course._id });
        await course.deleteOne();

        res.status(200).json({ success: true, message: 'تم الحذف 🗑️' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstructorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id })
            .populate('category', 'name')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitForReview = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'غير موجود' });

        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'غير مصرح' });
        }

        const lessonsCount = await Lesson.countDocuments({ course: course._id });
        if (lessonsCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'يجب إضافة درس واحد على الأقل'
            });
        }

        course.status = 'pending';
        await course.save();

        res.status(200).json({ success: true, message: 'تم إرسال الكورس للمراجعة 📤', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstructorStats = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        const totalStudents = courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);

        const earningsData = await Payment.aggregate([
            { $match: { instructor: req.user._id, status: 'completed' } },
            { $group: { _id: null, totalEarnings: { $sum: '$instructorEarning' }, totalSales: { $sum: 1 } } }
        ]);

        const recentSales = await Payment.find({ instructor: req.user.id, status: 'completed' })
            .populate('student', 'firstName lastName')
            .populate('course', 'title')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalCourses: courses.length,
                    publishedCourses: courses.filter(c => c.status === 'published').length,
                    pendingCourses: courses.filter(c => c.status === 'pending').length,
                    draftCourses: courses.filter(c => c.status === 'draft').length,
                    totalStudents,
                    totalEarnings: earningsData[0]?.totalEarnings || 0,
                    totalSales: earningsData[0]?.totalSales || 0
                },
                recentSales
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};