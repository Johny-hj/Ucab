const express = require('express');
const {
  bookRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getRide,
  getRideHistory,
  rateRide,
  processPayment,
} = require('../controllers/rideController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: /history MUST come before /:id to avoid being caught by the param route
// @route   GET /api/rides/history
router.get('/history', protect, getRideHistory);

// @route   POST /api/rides/book
router.post('/book', protect, authorize('user'), bookRide);

// @route   GET /api/rides/:id
router.get('/:id', protect, getRide);

// @route   PUT /api/rides/:id/accept
router.put('/:id/accept', protect, authorize('driver'), acceptRide);

// @route   PUT /api/rides/:id/start
router.put('/:id/start', protect, authorize('driver'), startRide);

// @route   PUT /api/rides/:id/complete
router.put('/:id/complete', protect, authorize('driver'), completeRide);

// @route   PUT /api/rides/:id/cancel
router.put('/:id/cancel', protect, cancelRide);

// @route   PUT /api/rides/:id/rate
router.put('/:id/rate', protect, authorize('user'), rateRide);

// @route   PUT /api/rides/:id/pay
router.put('/:id/pay', protect, authorize('user'), processPayment);

module.exports = router;
