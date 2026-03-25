const express = require('express');

const {
  enroll,
  drop,
  getMyEnrollments,
  getCourseEnrollments,
} = require('../controllers/enrollmentController');

const router = express.Router();

router.post('/', enroll);
router.put('/drop/:id', drop);
router.get('/my', getMyEnrollments);
router.get('/course/:courseId', getCourseEnrollments);

module.exports = router;
