const Settings = require('../models/Settings');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { logInfo } = require('../utils/logger');

const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findById('SYSTEM_SETTINGS');

    if (!settings) {
      return sendError(res, 404, 'Settings not found.');
    }

    return sendSuccess(res, 200, { settings });
  } catch (error) {
    return next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const allowedFields = ['allowSelfEnrollment', 'maintenanceMode', 'maxEnrollment', 'activeSemesters'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const hasAnyAllowedField = allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field));
    if (!hasAnyAllowedField) {
      return sendError(res, 400, `Provide at least one valid settings field: ${allowedFields.join(', ')}`);
    }

    updates.updatedAt = new Date();

    const settings = await Settings.findByIdAndUpdate('SYSTEM_SETTINGS', updates, {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    logInfo('System settings updated');

    return sendSuccess(res, 200, { message: 'Settings updated successfully.', settings });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
