const express = require('express');

const {
  enroll,
  drop,
  getMyEnrollments,
  getCourseEnrollments,
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, allowRoles('student'), enroll);
router.put('/drop/:id', protect, allowRoles('student'), drop);
router.get('/my', protect, allowRoles('student'), getMyEnrollments);
router.get('/course/:courseId', protect, allowRoles('faculty'), getCourseEnrollments);

module.exports = router;
