const Payment = require('../models/Payment');

exports.getPaymentHistory = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') query.student = req.user.id;
        if (req.user.role === 'instructor') query.instructor = req.user.id;

        const payments = await Payment.find(query)
            .populate('course', 'title')
            .populate('student', 'firstName lastName')
            .populate('instructor', 'firstName lastName')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};