const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const requireFields = (fieldsArray, reqBody) => {
  const missingFields = fieldsArray.filter((field) => {
    const value = reqBody[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    return `Missing required field(s): ${missingFields.join(', ')}`;
  }

  return null;
};

const isValidEmail = (email) => {
  return EMAIL_REGEX.test(String(email || '').toLowerCase());
};

module.exports = {
  isValidObjectId,
  requireFields,
  isValidEmail,
};
