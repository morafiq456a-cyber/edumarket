const express = require('express');
const router = express.Router();
const {
    register, login, getMe, updateProfile,
    uploadAvatar, changePassword, toggleWishlist
} = require('../controllers/authController');
const protect = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/upload-avatar', protect, uploadImage.single('image'), uploadAvatar);
router.put('/change-password', protect, changePassword);
router.put('/wishlist/:courseId', protect, toggleWishlist);

module.exports = router;