const express = require('express');
const router = express.Router();
const {
    createCourse, getAllCourses, getCourse,
    updateCourse, deleteCourse, getInstructorCourses,
    submitForReview, getInstructorStats
} = require('../controllers/courseController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/instructor/my-courses', protect, roleCheck('instructor', 'admin'), getInstructorCourses);
router.get('/instructor/stats', protect, roleCheck('instructor', 'admin'), getInstructorStats);
router.put('/:id/submit-review', protect, roleCheck('instructor', 'admin'), submitForReview);

router.get('/', getAllCourses);
router.get('/:id', getCourse);
router.post('/', protect, roleCheck('instructor', 'admin'), createCourse);
router.put('/:id', protect, roleCheck('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, roleCheck('instructor', 'admin'), deleteCourse);

module.exports = router;