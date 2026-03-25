const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User is not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not allowed to access this resource.' });
    }

    return next();
  };
};

module.exports = {
  allowRoles,
};
