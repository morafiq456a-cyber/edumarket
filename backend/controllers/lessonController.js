const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.createLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.body.course);
        if (!course) return res.status(404).json({ success: false, message: 'الكورس غير موجود' });

        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'غير مصرح' });
        }

        const lessonsCount = await Lesson.countDocuments({ course: course._id });
        req.body.order = lessonsCount + 1;

        const lesson = await Lesson.create(req.body);
        await Course.findByIdAndUpdate(course._id, { totalLessons: lessonsCount + 1 });

        res.status(201).json({ success: true, message: 'تم إضافة الدرس 📖', data: lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCourseLessons = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const enrollment = await Enrollment.findOne({ student: req.user.id, course: courseId });
        const course = await Course.findById(courseId);

        if (!enrollment && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            const freeLessons = await Lesson.find({ course: courseId, isFreePreview: true }).sort('order');
            return res.status(200).json({
                success: true,
                enrolled: false,
                message: 'يجب الاشتراك للمشاهدة',
                data: freeLessons
            });
        }

        const lessons = await Lesson.find({ course: courseId }).sort('order');

        res.status(200).json({
            success: true,
            enrolled: true,
            count: lessons.length,
            completedLessons: enrollment ? enrollment.completedLessons : [],
            progress: enrollment ? enrollment.progress : 0,
            data: lessons
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ success: false, message: 'الدرس غير موجود' });
        res.status(200).json({ success: true, data: lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lesson) return res.status(404).json({ success: false, message: 'الدرس غير موجود' });
        res.status(200).json({ success: true, message: 'تم التحديث ✅', data: lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ success: false, message: 'غير موجود' });

        await lesson.deleteOne();
        const count = await Lesson.countDocuments({ course: lesson.course });
        await Course.findByIdAndUpdate(lesson.course, { totalLessons: count });

        res.status(200).json({ success: true, message: 'تم الحذف 🗑️' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reorderLessons = async (req, res) => {
    try {
        const { lessons } = req.body;
        const updates = lessons.map(item => Lesson.findByIdAndUpdate(item.id, { order: item.order }));
        await Promise.all(updates);
        res.status(200).json({ success: true, message: 'تم إعادة الترتيب ✅' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markLessonComplete = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.body.courseId
        });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'أنت غير مشترك' });
        }

        if (!enrollment.completedLessons.includes(req.params.id)) {
            enrollment.completedLessons.push(req.params.id);
        }

        const totalLessons = await Lesson.countDocuments({ course: req.body.courseId });
        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

        if (enrollment.progress === 100) {
            enrollment.isCompleted = true;
            enrollment.completedAt = Date.now();
        }

        enrollment.lastAccessedLesson = req.params.id;
        await enrollment.save();

        res.status(200).json({
            success: true,
            message: enrollment.isCompleted ? '🎉 مبروك! أكملت الكورس!' : 'تم حفظ التقدم ✅',
            data: { progress: enrollment.progress, isCompleted: enrollment.isCompleted }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};