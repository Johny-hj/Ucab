const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['auto', 'bike', 'sedan', 'suv'],
      required: [true, 'Please specify vehicle type'],
    },
    vehicleName: {
      type: String,
      required: [true, 'Please provide vehicle name'],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Please provide vehicle number'],
      uppercase: true,
      trim: true,
    },
    vehicleColor: {
      type: String,
      required: [true, 'Please provide vehicle color'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide license number'],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries
driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
