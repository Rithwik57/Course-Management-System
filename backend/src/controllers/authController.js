const login = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const register = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const getMe = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

module.exports = {
  login,
  register,
  getMe,
};
