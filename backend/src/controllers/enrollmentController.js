const enroll = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const drop = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const getMyEnrollments = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const getCourseEnrollments = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

module.exports = {
  enroll,
  drop,
  getMyEnrollments,
  getCourseEnrollments,
};
