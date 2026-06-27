/**
 * Socket.IO event handler for real-time ride updates
 */
const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    /**
     * Join a ride room to receive real-time updates
     * @param {string} rideId - The ride ID to join
     */
    socket.on('join-ride', (rideId) => {
      socket.join(rideId);
      console.log(`Socket ${socket.id} joined ride room: ${rideId}`);
    });

    /**
     * Handle driver location updates
     * Broadcast to all clients in the ride room
     * @param {object} data - { rideId, latitude, longitude }
     */
    socket.on('update-location', (data) => {
      const { rideId, latitude, longitude } = data;
      socket.to(rideId).emit('location-updated', {
        latitude,
        longitude,
        timestamp: new Date(),
      });
    });

    /**
     * Handle ride status changes
     * Broadcast to all clients in the ride room
     * @param {object} data - { rideId, status, message }
     */
    socket.on('ride-status-change', (data) => {
      const { rideId, status, message } = data;
      socket.to(rideId).emit('status-changed', {
        status,
        message,
        timestamp: new Date(),
      });
    });

    /**
     * Handle client disconnect
     */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
