const express = require('express');
const {
  processPayment,
  getPaymentHistory,
  getReceipt,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/process
router.post('/process', protect, processPayment);

// @route   GET /api/payments/history
router.get('/history', protect, getPaymentHistory);

// @route   GET /api/payments/:id/receipt
router.get('/:id/receipt', protect, getReceipt);

module.exports = router;
