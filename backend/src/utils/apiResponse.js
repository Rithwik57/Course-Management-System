const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
