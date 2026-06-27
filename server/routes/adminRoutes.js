const express = require('express');
const {
  getAllUsers,
  getAllDrivers,
  verifyDriver,
  getAllRides,
  getStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   GET /api/admin/drivers
router.get('/drivers', getAllDrivers);

// @route   PUT /api/admin/drivers/:id/verify
router.put('/drivers/:id/verify', verifyDriver);

// @route   GET /api/admin/rides
router.get('/rides', getAllRides);

// @route   GET /api/admin/stats
router.get('/stats', getStats);

module.exports = router;
