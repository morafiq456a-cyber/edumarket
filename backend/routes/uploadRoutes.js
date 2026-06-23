const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadImage, uploadVideo } = require('../middleware/upload');

router.post('/image', protect, roleCheck('instructor', 'admin'), uploadImage.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
    res.status(200).json({
        success: true,
        message: 'تم الرفع ✅',
        data: { url: req.file.path, publicId: req.file.filename }
    });
});

router.post('/video', protect, roleCheck('instructor', 'admin'), uploadVideo.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع فيديو' });
    res.status(200).json({
        success: true,
        message: 'تم الرفع ✅',
        data: { url: req.file.path, publicId: req.file.filename }
    });
});

module.exports = router;