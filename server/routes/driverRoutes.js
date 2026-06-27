const express = require('express');
const {
  registerDriver,
  updateLocation,
  toggleAvailability,
  getNearbyDrivers,
  getDriverStats,
  getDriverProfile,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/drivers/register
router.post('/register', protect, registerDriver);

// @route   PUT /api/drivers/location
router.put('/location', protect, authorize('driver'), updateLocation);

// @route   PUT /api/drivers/availability
router.put('/availability', protect, authorize('driver'), toggleAvailability);

// @route   GET /api/drivers/nearby
router.get('/nearby', getNearbyDrivers);

// @route   GET /api/drivers/stats
router.get('/stats', protect, authorize('driver'), getDriverStats);

// @route   GET /api/drivers/profile
router.get('/profile', protect, authorize('driver'), getDriverProfile);

module.exports = router;
