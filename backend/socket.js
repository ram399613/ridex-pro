const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO on top of the existing HTTP server.
 * Every browser tab connects here automatically (frontend/js/realtime.js).
 *
 * Rooms used:
 *  - "public"        -> every connected client (vehicle availability, new listings)
 *  - "admin"         -> connected admin users only (live stats, new bookings, contact msgs)
 *  - "user:<userId>" -> a specific logged-in user (personal booking notifications)
 */
function initSocket(server) {
  const corsOrigin = process.env.CORS_ORIGIN;
  io = new Server(server, {
    cors: { origin: corsOrigin || '*', credentials: true },
    path: '/api/socket.io/',
  });

  io.on('connection', (socket) => {
    socket.join('public');

    // Client tells us who they are right after connecting (see realtime.js)
    socket.on('auth:join', ({ userId, role } = {}) => {
      if (userId) socket.join(`user:${userId}`);
      if (role === 'admin') socket.join('admin');
    });

    socket.on('disconnect', () => {
      // no-op, rooms are cleaned up automatically
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized yet. Call initSocket(server) first.');
  return io;
}

/* ===== Broadcast helpers used by routes ===== */

// Notify everyone browsing the site that a vehicle changed (availability, price, etc.)
const emitVehicleUpdated = (vehicle) => getIO().to('public').emit('vehicle:updated', vehicle);
const emitVehicleCreated = (vehicle) => getIO().to('public').emit('vehicle:created', vehicle);
const emitVehicleDeleted = (vehicleId) => getIO().to('public').emit('vehicle:deleted', { _id: vehicleId });

// Notify admin dashboards to refresh live stats / booking feed
const emitAdminBookingNew = (booking) => getIO().to('admin').emit('admin:booking:new', booking);
const emitAdminBookingUpdated = (booking) => getIO().to('admin').emit('admin:booking:updated', booking);
const emitAdminRefresh = () => getIO().to('admin').emit('admin:stats:refresh');
const emitAdminContact = (message) => getIO().to('admin').emit('admin:contact:new', message);

// Notify one specific user (e.g. admin confirmed/cancelled their booking, payment update)
const emitUserNotification = (userId, payload) => getIO().to(`user:${userId}`).emit('notification', payload);

module.exports = {
  initSocket,
  getIO,
  emitVehicleUpdated,
  emitVehicleCreated,
  emitVehicleDeleted,
  emitAdminBookingNew,
  emitAdminBookingUpdated,
  emitAdminRefresh,
  emitAdminContact,
  emitUserNotification,
};
