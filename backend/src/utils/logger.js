const formatMessage = (level, message) => {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
};

const logInfo = (message) => {
  console.log(formatMessage('INFO', message));
};

const logError = (message) => {
  console.error(formatMessage('ERROR', message));
};

module.exports = {
  logInfo,
  logError,
};
