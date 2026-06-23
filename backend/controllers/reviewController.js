const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');

exports.createReview = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.body.course
        });

        if (!enrollment) {
            return res.status(400).json({
                success: false,
                message: 'يجب الاشتراك في الكورس للتقييم'
            });
        }

        req.body.student = req.user.id;
        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            message: 'شكراً على تقييمك ⭐',
            data: review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'لقد قيمت هذا الكورس بالفعل'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCourseReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            course: req.params.courseId,
            isApproved: true
        })
            .populate('student', 'firstName lastName avatar')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};