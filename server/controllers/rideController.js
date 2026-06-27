const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { ErrorResponse } = require('../middleware/errorHandler');
const { calculateFare } = require('../utils/fareCalculator');

/**
 * Haversine formula to calculate distance between two coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Generate a 4-digit OTP
 * @returns {string} 4-digit OTP
 */
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * @desc    Book a new ride
 * @route   POST /api/rides/book
 * @access  Private (User)
 */
const bookRide = async (req, res, next) => {
  try {
    const {
      pickupCoordinates,
      pickupAddress,
      dropoffCoordinates,
      dropoffAddress,
      vehicleType,
      paymentMethod,
      surgeMultiplier,
      discountPercent,
    } = req.body;

    // Validate required fields
    if (!pickupCoordinates || !dropoffCoordinates || !pickupAddress || !dropoffAddress) {
      return next(new ErrorResponse('Please provide pickup and dropoff locations', 400));
    }

    if (!vehicleType) {
      return next(new ErrorResponse('Please specify vehicle type', 400));
    }

    // Calculate distance using Haversine formula
    const distance = haversineDistance(
      pickupCoordinates[1], // latitude
      pickupCoordinates[0], // longitude
      dropoffCoordinates[1],
      dropoffCoordinates[0]
    );

    // Estimate duration (approximate: 2 min per km in city)
    const estimatedDuration = Math.round(distance * 2);

    // Calculate fare
    const fare = calculateFare(distance, vehicleType, {
      duration: estimatedDuration,
      surgeMultiplier: surgeMultiplier || 1.0,
      discountPercent: discountPercent || 0,
    });

    // Generate OTP for ride verification
    const otp = generateOTP();

    // Create ride
    const ride = await Ride.create({
      user: req.user._id,
      pickupLocation: {
        type: 'Point',
        coordinates: pickupCoordinates,
        address: pickupAddress,
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: dropoffCoordinates,
        address: dropoffAddress,
      },
      vehicleType,
      distance,
      duration: estimatedDuration,
      fare,
      paymentMethod: paymentMethod || 'cash',
      otp,
    });

    res.status(201).json({
      success: true,
      data: ride,
    });

    // Emit socket event to drivers
    const io = req.app.get('io');
    if (io) {
      const populatedRide = await Ride.findById(ride._id).populate('user', 'name phone');
      io.emit('new-ride-request', populatedRide);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a ride (driver)
 * @route   PUT /api/rides/:id/accept
 * @access  Private (Driver)
 */
const acceptRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (ride.status !== 'requested') {
      return next(new ErrorResponse('Ride is no longer available', 400));
    }

    // Find driver profile
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return next(new ErrorResponse('Driver profile not found', 404));
    }

    // Update ride
    ride.status = 'accepted';
    ride.driver = driver._id;
    await ride.save();

    // Mark driver as unavailable
    driver.isAvailable = false;
    await driver.save();

    const populatedRide = await Ride.findById(ride._id)
      .select('+otp')
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone',
        },
      });

    res.status(200).json({
      success: true,
      data: populatedRide,
    });

    // Notify others via socket
    const io = req.app.get('io');
    if (io) {
      // Notify other drivers to clear this request
      io.emit('request-removed', { rideId: ride._id });
      // Notify the user tracking the ride
      io.to(ride._id.toString()).emit('ride-status-changed', { status: 'accepted' });
      io.to(ride._id.toString()).emit('ride-updated', populatedRide);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start a ride (verify OTP)
 * @route   PUT /api/rides/:id/start
 * @access  Private (Driver)
 */
const startRide = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (ride.status !== 'accepted') {
      return next(new ErrorResponse('Ride must be accepted before starting', 400));
    }

    // Verify OTP
    if (!otp || otp !== ride.otp) {
      return next(new ErrorResponse('Invalid OTP', 400));
    }

    ride.status = 'in-progress';
    await ride.save();

    res.status(200).json({
      success: true,
      data: ride,
    });

    // Notify user via socket
    const io = req.app.get('io');
    if (io) {
      io.to(ride._id.toString()).emit('ride-status-changed', { status: 'in-progress' });
      io.to(ride._id.toString()).emit('ride-updated', ride);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete a ride
 * @route   PUT /api/rides/:id/complete
 * @access  Private (Driver)
 */
const completeRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (ride.status !== 'in-progress') {
      return next(new ErrorResponse('Ride must be in-progress to complete', 400));
    }

    // Recalculate final fare if actual distance/duration provided
    const { actualDistance, actualDuration } = req.body;
    if (actualDistance || actualDuration) {
      const finalFare = calculateFare(
        actualDistance || ride.distance,
        ride.vehicleType,
        { duration: actualDuration || ride.duration }
      );
      ride.fare = finalFare;
      if (actualDistance) ride.distance = actualDistance;
      if (actualDuration) ride.duration = actualDuration;
    }

    ride.status = 'completed';
    await ride.save();

    // Update driver stats
    const driver = await Driver.findById(ride.driver);
    if (driver) {
      driver.totalRides = (Number(driver.totalRides) || 0) + 1;
      driver.isAvailable = true;
      await driver.save();
    }

    res.status(200).json({
      success: true,
      data: ride,
    });

    // Notify user via socket
    const io = req.app.get('io');
    if (io) {
      io.to(ride._id.toString()).emit('ride-status-changed', { status: 'completed' });
      io.to(ride._id.toString()).emit('ride-updated', ride);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a ride
 * @route   PUT /api/rides/:id/cancel
 * @access  Private
 */
const cancelRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return next(new ErrorResponse('Cannot cancel this ride', 400));
    }

    ride.status = 'cancelled';
    ride.cancelReason = req.body.cancelReason || 'Cancelled by user';
    await ride.save();

    // If a driver was assigned, make them available again
    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single ride
 * @route   GET /api/rides/:id
 * @access  Private
 */
const getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .select('+otp')
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      });

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ride history for current user
 * @route   GET /api/rides/history
 * @access  Private
 */
const getRideHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { user: req.user._id };
    
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user._id });
      if (driver) {
        query.driver = driver._id;
        delete query.user;
      }
    }

    if (req.query.status) {
      const statuses = req.query.status.split(',');
      query.status = { $in: statuses };
    }

    const total = await Ride.countDocuments(query);
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name phone email')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone',
        },
      });

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
 * @desc    Rate a completed ride
 * @route   PUT /api/rides/:id/rate
 * @access  Private (User)
 */
const rateRide = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new ErrorResponse('Please provide a rating between 1 and 5', 400));
    }

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (ride.status !== 'completed') {
      return next(new ErrorResponse('Can only rate completed rides', 400));
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to rate this ride', 403));
    }

    ride.rating = rating;
    if (review) ride.review = review;
    await ride.save();

    // Recalculate driver's average rating
    if (ride.driver) {
      const driverRides = await Ride.find({
        driver: ride.driver,
        rating: { $exists: true, $ne: null },
      });

      const avgRating =
        driverRides.reduce((sum, r) => sum + r.rating, 0) / driverRides.length;

      await Driver.findByIdAndUpdate(ride.driver, {
        rating: Math.round(avgRating * 10) / 10,
      });
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process ride payment
 * @route   PUT /api/rides/:id/pay
 * @access  Private (User)
 */
const processPayment = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new ErrorResponse('Ride not found', 404));
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to pay for this ride', 403));
    }

    if (ride.paymentStatus === 'paid' || ride.paymentStatus === 'completed') {
      return next(new ErrorResponse('Payment already processed', 400));
    }

    ride.paymentStatus = 'completed'; // Setting to 'completed' per schema enum (or 'paid' if your frontend uses that, let's use 'completed')
    await ride.save();

    // Add earnings to driver account NOW
    if (ride.driver) {
      const driver = await Driver.findById(ride.driver);
      if (driver) {
        const fareToAdd = Number(ride.fare?.totalFare) || Number(ride.fare) || 0;
        driver.totalEarnings = (Number(driver.totalEarnings) || 0) + (isNaN(fareToAdd) ? 0 : fareToAdd);
        await driver.save();
      }
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getRide,
  getRideHistory,
  rateRide,
  processPayment,
};
