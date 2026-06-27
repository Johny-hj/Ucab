const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Process payment for a ride
 * @route   POST /api/payments/process
 * @access  Private
 */
const processPayment = async (req, res, next) => {
  try {
    const { rideId, method } = req.body;

    if (!rideId) {
      return next(new ErrorResponse('Please provide ride ID', 400));
    }

    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (ride.paymentStatus === 'completed') {
      return next(new ErrorResponse('Payment already completed for this ride', 400));
    }

    const paymentMethod = method || ride.paymentMethod;
    const amount = ride.fare.totalFare;

    // Generate simulated transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id);
      if (user.walletBalance < amount) {
        return next(new ErrorResponse('Insufficient wallet balance', 400));
      }
      user.walletBalance -= amount;
      await user.save();
    }

    // Create payment record
    const payment = await Payment.create({
      ride: ride._id,
      user: req.user._id,
      driver: ride.driver,
      amount,
      method: paymentMethod,
      transactionId,
      status: 'completed',
    });

    // Update ride payment status
    ride.paymentStatus = 'completed';
    ride.paymentMethod = paymentMethod;
    await ride.save();

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment history for current user
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Payment.countDocuments({ user: req.user._id });
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'ride',
        select: 'pickupLocation dropoffLocation distance duration status vehicleType createdAt',
      });

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment receipt
 * @route   GET /api/payments/:id/receipt
 * @access  Private
 */
const getReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'ride',
        select:
          'pickupLocation dropoffLocation distance duration fare vehicleType status createdAt',
      })
      .populate('user', 'name email phone');

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    // Verify the payment belongs to the requesting user
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to view this receipt', 403));
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentHistory,
  getReceipt,
};
