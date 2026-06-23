const express = require('express');
const router = express.Router();
const {
    getDashboardStats, getAllUsers, toggleUserStatus, changeUserRole,
    deleteUser, getAllCourses, getPendingCourses, approveCourse,
    rejectCourse, deleteCourse, getAllPayments,
    createCategory, updateCategory, deleteCategory
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(protect, roleCheck('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/change-role', changeUserRole);
router.delete('/users/:id', deleteUser);

router.get('/courses', getAllCourses);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/payments', getAllPayments);

router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;