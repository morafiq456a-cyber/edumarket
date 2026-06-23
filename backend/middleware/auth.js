const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح لك، يجب تسجيل الدخول'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'حسابك محظور'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'توكن غير صالح'
        });
    }
};

module.exports = protect;