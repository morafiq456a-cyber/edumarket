const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.enrollFree = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'الكورس غير موجود' });

        if (!course.isFree && course.price > 0) {
            return res.status(400).json({ success: false, message: 'هذا الكورس مدفوع' });
        }

        const existing = await Enrollment.findOne({ student: req.user.id, course: course._id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'أنت مشترك بالفعل' });
        }

        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: course._id
        });

        await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });
        await User.findByIdAndUpdate(req.user.id, { $push: { enrolledCourses: course._id } });

        res.status(201).json({
            success: true,
            message: 'تم الاشتراك بنجاح! 🎉',
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.enrollPaid = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'الكورس غير موجود' });

        const existing = await Enrollment.findOne({ student: req.user.id, course: course._id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'أنت مشترك بالفعل' });
        }

        const price = course.discountPrice > 0 ? course.discountPrice : course.price;
        const platformFee = price * 0.20;
        const instructorEarning = price - platformFee;

        await Payment.create({
            student: req.user.id,
            course: course._id,
            instructor: course.instructor,
            amount: price,
            platformFee,
            instructorEarning,
            paymentMethod: 'demo',
            status: 'completed'
        });

        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: course._id
        });

        await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });
        await User.findByIdAndUpdate(req.user.id, { $push: { enrolledCourses: course._id } });
        await User.findByIdAndUpdate(course.instructor, { $inc: { totalEarnings: instructorEarning } });

        res.status(201).json({
            success: true,
            message: 'تم الدفع والاشتراك بنجاح! 🎉',
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate({
                path: 'course',
                select: 'title thumbnail instructor totalLessons',
                populate: { path: 'instructor', select: 'firstName lastName' }
            })
            .sort('-enrolledAt');

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};