const getUsers = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const createUser = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const updateUser = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
