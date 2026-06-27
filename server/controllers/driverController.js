const Driver = require('../models/Driver');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Register as a driver
 * @route   POST /api/drivers/register
 * @access  Private
 */
const registerDriver = async (req, res, next) => {
  try {
    const { vehicleType, vehicleName, vehicleNumber, vehicleColor, licenseNumber } = req.body;

    // Check if already registered as driver
    const existingDriver = await Driver.findOne({ user: req.user._id });
    if (existingDriver) {
      return next(new ErrorResponse('Already registered as a driver', 400));
    }

    // Create driver profile
    const driver = await Driver.create({
      user: req.user._id,
      vehicleType,
      vehicleName,
      vehicleNumber,
      vehicleColor,
      licenseNumber,
    });

    // Update user role to driver
    await User.findByIdAndUpdate(req.user._id, { role: 'driver' });

    res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update driver's current location
 * @route   PUT /api/drivers/location
 * @access  Private (Driver)
 */
const updateLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;

    if (longitude === undefined || latitude === undefined) {
      return next(new ErrorResponse('Please provide longitude and latitude', 400));
    }

    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
      { new: true }
    );

    if (!driver) {
      return next(new ErrorResponse('Driver profile not found', 404));
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
 * @desc    Toggle driver availability
 * @route   PUT /api/drivers/availability
 * @access  Private (Driver)
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return next(new ErrorResponse('Driver profile not found', 404));
    }

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get nearby available drivers
 * @route   GET /api/drivers/nearby
 * @access  Public
 */
const getNearbyDrivers = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 5000, vehicleType } = req.query;

    if (!longitude || !latitude) {
      return next(new ErrorResponse('Please provide longitude and latitude', 400));
    }

    const query = {
      currentLocation: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isAvailable: true,
      isVerified: true,
    };

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    const drivers = await Driver.find(query).populate('user', 'name phone');

    // Calculate approximate distance for each driver
    const driversWithDistance = drivers.map((driver) => {
      const driverObj = driver.toObject();
      const [driverLng, driverLat] = driver.currentLocation.coordinates;
      const R = 6371; // Earth's radius in km
      const dLat = ((driverLat - parseFloat(latitude)) * Math.PI) / 180;
      const dLng = ((driverLng - parseFloat(longitude)) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((parseFloat(latitude) * Math.PI) / 180) *
          Math.cos((driverLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      driverObj.distance = Math.round(R * c * 100) / 100; // Distance in km
      return driverObj;
    });

    res.status(200).json({
      success: true,
      count: driversWithDistance.length,
      data: driversWithDistance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get driver statistics
 * @route   GET /api/drivers/stats
 * @access  Private (Driver)
 */
const getDriverStats = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return next(new ErrorResponse('Driver profile not found', 404));
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const Ride = require('../models/Ride');
    const todayRides = await Ride.find({
      driver: driver._id,
      status: 'completed',
      paymentStatus: 'completed',
      updatedAt: { $gte: startOfDay }
    });

    const todayEarnings = todayRides.reduce((sum, ride) => {
      const fareAmount = Number(ride.fare?.totalFare) || Number(ride.fare) || 0;
      return sum + (isNaN(fareAmount) ? 0 : fareAmount);
    }, 0);

    const safeTotalEarnings = Number(driver.totalEarnings) || 0;
    const safeTotalRides = Number(driver.totalRides) || 0;

    res.status(200).json({
      success: true,
      data: {
        totalRides: safeTotalRides,
        totalEarnings: safeTotalEarnings,
        todayEarnings: todayEarnings,
        rating: driver.rating,
        isAvailable: driver.isAvailable,
        isVerified: driver.isVerified,
        vehicleType: driver.vehicleType,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get driver profile
 * @route   GET /api/drivers/profile
 * @access  Private (Driver)
 */
const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone avatar'
    );

    if (!driver) {
      return next(new ErrorResponse('Driver profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDriver,
  updateLocation,
  toggleAvailability,
  getNearbyDrivers,
  getDriverStats,
  getDriverProfile,
};
