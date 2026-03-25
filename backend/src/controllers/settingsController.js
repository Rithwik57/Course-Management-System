const getSettings = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

const updateSettings = async (req, res, next) => {
  return res.json({ message: 'Route working' });
};

module.exports = {
  getSettings,
  updateSettings,
};
