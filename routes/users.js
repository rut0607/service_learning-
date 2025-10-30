const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  getCurrentUser,
  updateInterests,
  deleteUser
} = require('../controllers/users');

const router = express.Router();

// Get all users - Admin only
router.get('/', protect, authorize('admin'), getUsers);

// Get current user profile
router.get('/me', protect, getCurrentUser);

// Get user by ID - Admin or own user
router.get('/:id', protect, getUser);

// Update user interests - Own user only
router.put('/:id/interests', protect, updateInterests);

// Delete user - Admin or own user
router.delete('/:id', protect, deleteUser);

module.exports = router;