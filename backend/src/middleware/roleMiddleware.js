const { sendError } = require('../utils/apiResponse');

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User is not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You are not allowed to access this resource.');
    }

    return next();
  };
};

module.exports = {
  allowRoles,
};
