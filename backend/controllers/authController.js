const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { cloudinary } = require('../middleware/upload');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني مسجل بالفعل'
            });
        }

        const safeRole = role === 'instructor' ? 'instructor' : 'student';

        const user = await User.create({
            firstName, lastName, email, password, role: safeRole
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح! 🎉',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني وكلمة المرور مطلوبين'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'حسابك محظور'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح! 👋',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('enrolledCourses', 'title thumbnail price')
            .populate('wishlist', 'title thumbnail price');

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, phone, headline, website, linkedin, twitter, youtube } = req.body;

        const updateData = { firstName, lastName, bio, phone, headline };
        if (website !== undefined || linkedin !== undefined || twitter !== undefined || youtube !== undefined) {
            updateData.socialLinks = { website, linkedin, twitter, youtube };
        }

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: 'تم تحديث البيانات ✅',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
        }

        const user = await User.findById(req.user.id);
        if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId);
        }

        user.avatar = req.file.path;
        user.avatarPublicId = req.file.filename;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'تم تحديث الصورة 📸',
            data: { avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        user.password = newPassword;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'تم تغيير كلمة المرور 🔐',
            data: { token }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleWishlist = async (req, res) => {
    try {
        const { courseId } = req.params;
        const user = await User.findById(req.user.id);

        const isInWishlist = user.wishlist.includes(courseId);

        if (isInWishlist) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== courseId);
        } else {
            user.wishlist.push(courseId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: isInWishlist ? 'تم الإزالة من المفضلة' : 'تم الإضافة للمفضلة ❤️',
            data: { inWishlist: !isInWishlist }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};