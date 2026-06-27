const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for Windows DNS SRV resolution issues with MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...\n');

    // Clear all existing data
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Ride.deleteMany({});
    await Payment.deleteMany({});
    console.log('✅ Cleared all existing data\n');

    // ==================== Create Users ====================

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ucab.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
    });
    console.log(`👤 Admin created: ${adminUser.email}`);

    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@ucab.com',
      password: 'user123',
      phone: '9876543210',
      role: 'user',
      walletBalance: 500,
    });
    console.log(`👤 User created: ${regularUser.email}`);

    const driverUser = await User.create({
      name: 'Rajesh Kumar',
      email: 'driver@ucab.com',
      password: 'driver123',
      phone: '9123456789',
      role: 'driver',
    });
    console.log(`👤 Driver user created: ${driverUser.email}\n`);

    // ==================== Create Driver Profile ====================

    const driver = await Driver.create({
      user: driverUser._id,
      vehicleType: 'sedan',
      vehicleName: 'Maruti Swift Dzire',
      vehicleNumber: 'KA01AB1234',
      vehicleColor: 'White',
      licenseNumber: 'KA0120210012345',
      isAvailable: true,
      isVerified: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5946, 12.9716], // Bangalore coordinates
      },
      rating: 4.5,
      totalRides: 127,
      totalEarnings: 45000,
    });
    console.log(`🚗 Driver profile created: ${driver.vehicleName} (${driver.vehicleNumber})\n`);

    // ==================== Create Sample Rides ====================

    const ride1 = await Ride.create({
      user: regularUser._id,
      driver: driver._id,
      pickupLocation: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: 'MG Road, Bangalore',
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [77.6411, 12.9352],
        address: 'Koramangala, Bangalore',
      },
      vehicleType: 'sedan',
      distance: 7.2,
      duration: 25,
      fare: {
        baseFare: 50,
        distanceFare: 86.4,
        timeFare: 37.5,
        surgeFare: 0,
        discount: 0,
        totalFare: 173.9,
      },
      status: 'completed',
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      otp: '4521',
      rating: 5,
      review: 'Excellent ride! Very comfortable.',
    });
    console.log(`🚕 Ride 1 created: MG Road → Koramangala (₹${ride1.fare.totalFare})`);

    const ride2 = await Ride.create({
      user: regularUser._id,
      driver: driver._id,
      pickupLocation: {
        type: 'Point',
        coordinates: [77.6411, 12.9352],
        address: 'Koramangala, Bangalore',
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [77.5707, 12.9719],
        address: 'Majestic Bus Stand, Bangalore',
      },
      vehicleType: 'sedan',
      distance: 9.5,
      duration: 35,
      fare: {
        baseFare: 50,
        distanceFare: 114,
        timeFare: 52.5,
        surgeFare: 0,
        discount: 21.65,
        totalFare: 194.85,
      },
      status: 'completed',
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      otp: '7834',
      rating: 4,
      review: 'Good ride, driver was punctual.',
    });
    console.log(`🚕 Ride 2 created: Koramangala → Majestic (₹${ride2.fare.totalFare})\n`);

    // ==================== Create Sample Payments ====================

    const payment1 = await Payment.create({
      ride: ride1._id,
      user: regularUser._id,
      driver: driver._id,
      amount: ride1.fare.totalFare,
      method: 'cash',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
    });
    console.log(`💰 Payment 1 created: ₹${payment1.amount} (${payment1.method})`);

    const payment2 = await Payment.create({
      ride: ride2._id,
      user: regularUser._id,
      driver: driver._id,
      amount: ride2.fare.totalFare,
      method: 'wallet',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
    });
    console.log(`💰 Payment 2 created: ₹${payment2.amount} (${payment2.method})\n`);

    // ==================== Summary ====================

    console.log('========================================');
    console.log('        SEED DATA SUMMARY');
    console.log('========================================');
    console.log(`Users created:    3 (admin, user, driver)`);
    console.log(`Drivers created:  1`);
    console.log(`Rides created:    2 (both completed)`);
    console.log(`Payments created: 2`);
    console.log('========================================\n');
    console.log('Login Credentials:');
    console.log('  Admin:  admin@ucab.com  / admin123');
    console.log('  User:   user@ucab.com   / user123');
    console.log('  Driver: driver@ucab.com / driver123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Seed Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
