const User = require('../models/User');
const Driver = require('../models/Driver');
const generateToken = require('../utils/generateToken');
const { ErrorResponse } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, vehicle, licenseNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    // Create user
    const userRole = role || 'user';
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    if (userRole === 'driver') {
      if (!vehicle || !licenseNumber) {
        // We created the user, but missing driver info. Rollback or return error
        await User.findByIdAndDelete(user._id);
        return next(new ErrorResponse('Driver details are required', 400));
      }
      
      await Driver.create({
        user: user._id,
        vehicleType: vehicle.type,
        vehicleName: vehicle.name,
        vehicleNumber: vehicle.number,
        vehicleColor: vehicle.color,
        licenseNumber,
      });
    }

    // Remove password from response
    user.password = undefined;

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Remove password from response
    user.password = undefined;

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, password } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    // If updating password, hash it
    if (password) {
      if (password.length < 6) {
        return next(new ErrorResponse('Password must be at least 6 characters', 400));
      }
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
