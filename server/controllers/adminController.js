const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get all users (with search and pagination)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const search = req.query.search;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all drivers (with pagination and verification filter)
 * @route   GET /api/admin/drivers
 * @access  Private (Admin)
 */
const getAllDrivers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const { isVerified } = req.query;

    let query = {};
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    const total = await Driver.countDocuments(query);
    const drivers = await Driver.find(query)
      .populate('user', 'name email phone avatar')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or unverify a driver
 * @route   PUT /api/admin/drivers/:id/verify
 * @access  Private (Admin)
 */
const verifyDriver = async (req, res, next) => {
  try {
    const { verified } = req.body;

    if (verified === undefined) {
      return next(new ErrorResponse('Please provide verified status', 400));
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: verified },
      { new: true }
    ).populate('user', 'name email phone');

    if (!driver) {
      return next(new ErrorResponse('Driver not found', 404));
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all rides (with pagination and status filter)
 * @route   GET /api/admin/rides
 * @access  Private (Admin)
 */
const getAllRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const total = await Ride.countDocuments(query);
    const rides = await Ride.find(query)
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rides.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rides,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await Driver.countDocuments();
    const verifiedDrivers = await Driver.countDocuments({ isVerified: true });

    const totalRides = await Ride.countDocuments();
    const requestedRides = await Ride.countDocuments({ status: 'requested' });
    const acceptedRides = await Ride.countDocuments({ status: 'accepted' });
    const inProgressRides = await Ride.countDocuments({ status: 'in-progress' });
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });

    // Calculate total revenue from completed payments
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        users: totalUsers,
        drivers: {
          total: totalDrivers,
          verified: verifiedDrivers,
        },
        rides: {
          total: totalRides,
          requested: requestedRides,
          accepted: acceptedRides,
          inProgress: inProgressRides,
          completed: completedRides,
          cancelled: cancelledRides,
        },
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllDrivers,
  verifyDriver,
  getAllRides,
  getStats,
};
