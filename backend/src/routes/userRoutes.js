const express = require('express');

const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, allowRoles('admin'), getUsers);
router.post('/', protect, allowRoles('admin'), createUser);
router.put('/:id', protect, allowRoles('admin'), updateUser);

module.exports = router;
