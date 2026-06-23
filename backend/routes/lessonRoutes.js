const express = require('express');
const router = express.Router();
const {
    createLesson, getCourseLessons, getLesson,
    updateLesson, deleteLesson, markLessonComplete, reorderLessons
} = require('../controllers/lessonController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', protect, roleCheck('instructor', 'admin'), createLesson);
router.get('/course/:courseId', protect, getCourseLessons);
router.put('/reorder', protect, roleCheck('instructor', 'admin'), reorderLessons);
router.get('/:id', protect, getLesson);
router.put('/:id', protect, roleCheck('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, roleCheck('instructor', 'admin'), deleteLesson);
router.put('/:id/complete', protect, markLessonComplete);

module.exports = router;