const express = require('express');

const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, allowRoles('admin'), updateSettings);

module.exports = router;
