const roleCheck = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `صلاحية "${req.user.role}" غير مسموح لها`
            });
        }
        next();
    };
};

module.exports = roleCheck;