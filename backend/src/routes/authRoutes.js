const express = require('express');

const { login, register, getMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
