const express = require('express');

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFacultyMyCourses,
  getEnrollmentCount,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getAllCourses);
router.get('/faculty/my', protect, allowRoles('faculty'), getFacultyMyCourses);
router.get('/:id/enrollment-count', protect, allowRoles('admin', 'faculty'), getEnrollmentCount);
router.get('/:id', protect, getCourseById);
router.post('/', protect, allowRoles('admin'), createCourse);
router.put('/:id', protect, allowRoles('admin'), updateCourse);
router.delete('/:id', protect, allowRoles('admin'), deleteCourse);

module.exports = router;
