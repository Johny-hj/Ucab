const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: [true, 'Please provide pickup address'],
      },
    },
    dropoffLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: [true, 'Please provide dropoff address'],
      },
    },
    vehicleType: {
      type: String,
      enum: ['auto', 'bike', 'sedan', 'suv'],
      required: [true, 'Please specify vehicle type'],
    },
    distance: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    fare: {
      baseFare: { type: Number, default: 0 },
      distanceFare: { type: Number, default: 0 },
      timeFare: { type: Number, default: 0 },
      surgeFare: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalFare: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'arriving', 'in-progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'wallet'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    otp: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
rideSchema.index({ 'pickupLocation': '2dsphere' });
rideSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);
