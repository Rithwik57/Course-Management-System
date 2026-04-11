const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { requireFields, isValidEmail } = require('../utils/validators');
const { logInfo } = require('../utils/logger');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const requiredError = requireFields(['email', 'password'], req.body);
    if (requiredError) {
      return sendError(res, 400, requiredError);
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, 'Invalid email format.');
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logInfo(`User login success: ${user.email} (${user.role})`);

    return sendSuccess(res, 200, {
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const requiredError = requireFields(['name', 'email', 'password'], req.body);
    if (requiredError) {
      return sendError(res, 400, requiredError);
    }

    if (role && role !== 'student') {
      return sendError(res, 400, 'Role must be student.');
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, 'Invalid email format.');
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
      role: 'student',
      isActive: true,
    });

    logInfo(`Student registered: ${user.email}`);

    return sendSuccess(res, 201, {
      message: 'Student registered successfully.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return sendError(res, 409, 'Email already exists.');
    }
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  return sendSuccess(res, 200, {
    message: 'Profile fetched successfully.',
    user: req.user,
  });
};

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return sendError(res, 400, 'Token is required');
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    }).catch(e => { throw new Error('Invalid Google Token'); });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;
    
    let user = await User.findOne({ email: String(email).toLowerCase() });
    
    if (!user) {
      // Auto-register student
      user = await User.create({
        name,
        email: String(email).toLowerCase(),
        role: 'student',
        isActive: true,
      });
      logInfo(`Student registered via Google: ${user.email}`);
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    logInfo(`User login success (Google): ${user.email} (${user.role})`);
    
    return sendSuccess(res, 200, {
      message: 'Google Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 401, error.message || 'Invalid Google token');
  }
};

module.exports = {
  login,
  register,
  getMe,
  googleLogin,
};
