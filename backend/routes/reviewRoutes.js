const express = require('express');
const router = express.Router();
const { createReview, getCourseReviews } = require('../controllers/reviewController');
const protect = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/course/:courseId', getCourseReviews);

module.exports = router;