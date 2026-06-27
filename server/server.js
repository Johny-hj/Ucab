const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const dns = require('dns');

// Fix for Windows DNS SRV resolution issues with MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env vars
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const rideRoutes = require('./routes/rideRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Import socket handler
const setupSocket = require('./socket/socketHandler');

// Connect to database
connectDB();

// Create Express app
const app = express();
const server = http.createServer(app);

// ==================== Middleware ====================

// CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// ==================== Routes ====================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ucab API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (must be after routes)
app.use(errorHandler);

// ==================== Socket.IO ====================

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocket(io);

// Expose io to controllers
app.set('io', io);

// ==================== Start Server ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚗 Ucab Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server };
