const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const Category = require('../models/Category');
const Lesson = require('../models/Lesson');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: 'published' });
        const pendingCourses = await Course.countDocuments({ status: 'pending' });
        const totalEnrollments = await Enrollment.countDocuments();

        const revenueStats = await Payment.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    platformEarnings: { $sum: '$platformFee' },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const topCourses = await Course.find({ status: 'published' })
            .populate('instructor', 'firstName lastName')
            .sort({ totalStudents: -1 })
            .limit(5);

        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(8)
            .select('firstName lastName email role createdAt isActive');

        const recentPayments = await Payment.find({ status: 'completed' })
            .populate('student', 'firstName lastName')
            .populate('course', 'title')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers, totalStudents, totalInstructors,
                    totalCourses, publishedCourses, pendingCourses,
                    totalEnrollments,
                    totalRevenue: revenueStats[0]?.totalRevenue || 0,
                    platformEarnings: revenueStats[0]?.platformEarnings || 0,
                    totalTransactions: revenueStats[0]?.totalTransactions || 0
                },
                topCourses, recentUsers, recentPayments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.role) query.role = req.query.role;
        if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort('-createdAt').skip(skip).limit(limit);
        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true, total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'لا يمكن تعديل admin' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isActive ? 'تم التفعيل ✅' : 'تم الحظر ⛔',
            data: { isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'دور غير صالح' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });

        res.status(200).json({ success: true, message: 'تم تغيير الدور', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'غير موجود' });
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'لا يمكن حذف admin' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'تم الحذف 🗑️' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.search) query.title = { $regex: req.query.search, $options: 'i' };

        const courses = await Course.find(query)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name')
            .sort('-createdAt').skip(skip).limit(limit);

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true, total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: courses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'pending' })
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'published', rejectionReason: '' },
            { new: true }
        );
        if (!course) return res.status(404).json({ success: false, message: 'غير موجود' });

        res.status(200).json({ success: true, message: 'تمت الموافقة ✅', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectCourse = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'سبب الرفض مطلوب' });

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason: reason },
            { new: true }
        );
        if (!course) return res.status(404).json({ success: false, message: 'غير موجود' });

        res.status(200).json({ success: true, message: 'تم الرفض ❌', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'غير موجود' });

        await Lesson.deleteMany({ course: course._id });
        await Enrollment.deleteMany({ course: course._id });
        await Review.deleteMany({ course: course._id });
        await course.deleteOne();

        res.status(200).json({ success: true, message: 'تم الحذف 🗑️' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.status) query.status = req.query.status;

        const payments = await Payment.find(query)
            .populate('student', 'firstName lastName email')
            .populate('course', 'title')
            .populate('instructor', 'firstName lastName')
            .sort('-createdAt').skip(skip).limit(limit);

        const total = await Payment.countDocuments(query);

        const revenueData = await Payment.aggregate([
            { $match: { ...query, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, fee: { $sum: '$platformFee' } } }
        ]);

        res.status(200).json({
            success: true, total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            summary: {
                totalRevenue: revenueData[0]?.total || 0,
                platformFee: revenueData[0]?.fee || 0
            },
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, message: 'تم الإنشاء ✅', data: category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'التصنيف موجود بالفعل' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ success: false, message: 'غير موجود' });
        res.status(200).json({ success: true, message: 'تم التحديث ✅', data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const count = await Course.countDocuments({ category: req.params.id });
        if (count > 0) {
            return res.status(400).json({
                success: false,
                message: `يوجد ${count} كورس مرتبط بهذا التصنيف`
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'تم الحذف 🗑️' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};