const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { requireFields, isValidEmail, isValidObjectId } = require('../utils/validators');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return sendSuccess(res, 200, { users });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const requiredError = requireFields(['name', 'email', 'password', 'role'], req.body);
    if (requiredError) {
      return sendError(res, 400, requiredError);
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, 'Invalid email format.');
    }

    if (!['faculty', 'admin'].includes(role)) {
      return sendError(res, 400, 'Role must be either faculty or admin.');
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 409, 'Email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return sendSuccess(res, 201, {
      message: 'User created successfully.',
      user: safeUser,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return sendError(res, 409, 'Email already exists.');
    }
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'Invalid user id.');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    return sendSuccess(res, 200, {
      message: 'User disabled successfully.',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
