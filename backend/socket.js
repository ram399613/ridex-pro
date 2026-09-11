const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io = null;

function initSocket(server, cors) {
  io = new Server(server, {
    cors,
    path: '/api/socket.io/',
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // Public vehicle updates intentionally support guests.
    try {
      if (!process.env.JWT_SECRET) return next(new Error('Authentication is not configured'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id role');
      if (!user) return next(new Error('Invalid token'));
      socket.user = user;
      return next();
    } catch (_) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join('public');

    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
      if (socket.user.role === 'admin') socket.join('admin');
    }

    socket.on('disconnect', () => {

    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized yet. Call initSocket(server) first.');
  return io;
}

const emitVehicleUpdated = (vehicle) => getIO().to('public').emit('vehicle:updated', vehicle);
const emitVehicleCreated = (vehicle) => getIO().to('public').emit('vehicle:created', vehicle);
const emitVehicleDeleted = (vehicleId) => getIO().to('public').emit('vehicle:deleted', { _id: vehicleId });

const emitAdminBookingNew = (booking) => getIO().to('admin').emit('admin:booking:new', booking);
const emitAdminBookingUpdated = (booking) => getIO().to('admin').emit('admin:booking:updated', booking);
const emitAdminRefresh = () => getIO().to('admin').emit('admin:stats:refresh');
const emitAdminContact = (message) => getIO().to('admin').emit('admin:contact:new', message);

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
