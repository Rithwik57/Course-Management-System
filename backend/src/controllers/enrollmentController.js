const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Settings = require('../models/Settings');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { isValidObjectId, requireFields } = require('../utils/validators');
const { logInfo } = require('../utils/logger');

const enroll = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.userId;

    if (req.user.role !== 'student') {
      return sendError(res, 403, 'Only students can enroll');
    }

    const requiredError = requireFields(['courseId'], req.body);
    if (requiredError) {
      return sendError(res, 400, requiredError);
    }

    if (!isValidObjectId(courseId)) {
      return sendError(res, 400, 'Invalid courseId.');
    }

    const settings = await Settings.findById('SYSTEM_SETTINGS');
    if (!settings) {
      return sendError(res, 500, 'System settings not configured.');
    }

    if (settings.maintenanceMode) {
      return sendError(res, 400, 'Enrollment is disabled due to maintenance mode.');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (course.enrollStatus === 'Closed') {
      return sendError(res, 400, 'This course is closed for enrollment.');
    }

    if (!settings.allowSelfEnrollment) {
      return sendError(res, 400, 'Self enrollment is disabled by admin settings.');
    }

    const activeEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: 'active',
    });

    if (activeEnrollment) {
      return sendError(res, 400, 'Student is already actively enrolled in this course.');
    }

    const activeCount = await Enrollment.countDocuments({
      courseId,
      status: 'active',
    });

    if (activeCount >= settings.maxEnrollment) {
      return sendError(res, 400, 'Maximum enrollment limit has been reached for this course.');
    }

    const droppedEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: 'dropped',
    });

    if (droppedEnrollment) {
      droppedEnrollment.status = 'active';
      droppedEnrollment.enrolledAt = new Date();
      droppedEnrollment.droppedAt = null;
      await droppedEnrollment.save();

      logInfo(`Enrollment re-activated: student=${studentId}, course=${courseId}`);

      return sendSuccess(res, 200, {
        message: 'Enrollment re-activated successfully.',
        enrollment: droppedEnrollment,
      });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      enrolledAt: new Date(),
      status: 'active',
    });

    logInfo(`Enrollment created: student=${studentId}, course=${courseId}`);

    return sendSuccess(res, 201, {
      message: 'Enrollment created successfully.',
      enrollment,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return sendError(res, 400, 'Enrollment already exists for this student and course.');
    }
    return next(error);
  }
};

const drop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'Invalid enrollment id.');
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return sendError(res, 404, 'Enrollment not found.');
    }

    if (String(enrollment.studentId) !== String(studentId)) {
      return sendError(res, 403, 'You can only drop your own enrollments.');
    }

    if (enrollment.status === 'dropped') {
      return sendError(res, 400, 'Enrollment is already dropped.');
    }

    enrollment.status = 'dropped';
    enrollment.droppedAt = new Date();
    await enrollment.save();

    logInfo(`Enrollment dropped: enrollment=${id}, student=${studentId}`);

    return sendSuccess(res, 200, {
      message: 'Enrollment dropped successfully.',
      enrollment,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.userId;

    const enrollments = await Enrollment.find({
      studentId,
      status: 'active',
    })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    return sendSuccess(res, 200, { enrollments });
  } catch (error) {
    return next(error);
  }
};

const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return sendError(res, 400, 'Invalid courseId.');
    }

    const course = await Course.findById(courseId).select('facultyId');
    if (!course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!course.facultyId || String(course.facultyId) !== String(req.user.userId)) {
      return sendError(res, 403, 'You can only view enrollments for courses assigned to you.');
    }

    const enrollments = await Enrollment.find({
      courseId,
      status: 'active',
    })
      .populate('studentId', 'name email')
      .sort({ enrolledAt: -1 });

    return sendSuccess(res, 200, { enrollments });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  enroll,
  drop,
  getMyEnrollments,
  getCourseEnrollments,
};
