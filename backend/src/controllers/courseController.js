const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { isValidObjectId, requireFields } = require('../utils/validators');
const { logInfo } = require('../utils/logger');

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('facultyId', 'name')
      .sort({ createdAt: -1 });

    const result = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      details: course.details,
      semester: course.semester,
      enrollStatus: course.enrollStatus,
      facultyId: course.facultyId?._id || null,
      facultyName: course.facultyId?.name || null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return sendSuccess(res, 200, { courses: result });
  } catch (error) {
    return next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'Invalid course id.');
    }

    const course = await Course.findById(id).populate('facultyId', 'name');

    if (!course) {
      return sendError(res, 404, 'Course not found.');
    }

    return sendSuccess(res, 200, {
      course: {
        _id: course._id,
        title: course.title,
        details: course.details,
        semester: course.semester,
        enrollStatus: course.enrollStatus,
        facultyId: course.facultyId?._id || null,
        facultyName: course.facultyId?.name || null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, details, semester, enrollStatus, facultyId } = req.body;

    const requiredError = requireFields(['title', 'semester'], req.body);
    if (requiredError) {
      return sendError(res, 400, requiredError);
    }

    const payload = {
      title,
      details,
      semester,
    };

    if (enrollStatus) {
      payload.enrollStatus = enrollStatus;
    }

    if (facultyId) {
      if (!isValidObjectId(facultyId)) {
        return sendError(res, 400, 'Invalid facultyId.');
      }
      payload.facultyId = facultyId;
    }

    const course = await Course.create(payload);
    logInfo(`Course created: ${course.title} (${course._id})`);
    return sendSuccess(res, 201, { message: 'Course created successfully.', course });
  } catch (error) {
    return next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'Invalid course id.');
    }

    const allowedFields = ['title', 'details', 'semester', 'enrollStatus', 'facultyId'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.prototype.hasOwnProperty.call(updates, 'facultyId') && updates.facultyId) {
      if (!isValidObjectId(updates.facultyId)) {
        return sendError(res, 400, 'Invalid facultyId.');
      }
    }

    const course = await Course.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return sendError(res, 404, 'Course not found.');
    }

    return sendSuccess(res, 200, { message: 'Course updated successfully.', course });
  } catch (error) {
    return next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'Invalid course id.');
    }

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return sendError(res, 404, 'Course not found.');
    }

    return sendSuccess(res, 200, { message: 'Course deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

const getFacultyMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ facultyId: req.user.userId })
      .populate('facultyId', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, { courses });
  } catch (error) {
    return next(error);
  }
};

const getEnrollmentCount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'Invalid course id.');
    }

    const course = await Course.findById(id).select('facultyId');
    if (!course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (req.user.role === 'faculty' && String(course.facultyId) !== String(req.user.userId)) {
      return sendError(res, 403, 'You can only view enrollment count for your assigned courses.');
    }

    const count = await Enrollment.countDocuments({
      courseId: id,
      status: 'active',
    });

    return sendSuccess(res, 200, {
      courseId: id,
      count,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFacultyMyCourses,
  getEnrollmentCount,
};
