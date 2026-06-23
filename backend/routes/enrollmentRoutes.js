const express = require('express');
const router = express.Router();
const { enrollFree, enrollPaid, getMyCourses } = require('../controllers/enrollmentController');
const protect = require('../middleware/auth');

router.post('/enroll-free/:courseId', protect, enrollFree);
router.post('/enroll-paid/:courseId', protect, enrollPaid);
router.get('/my-courses', protect, getMyCourses);

module.exports = router;