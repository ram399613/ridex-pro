const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  const corsOrigin = process.env.CORS_ORIGIN;
  io = new Server(server, {
    cors: { origin: corsOrigin || '*', credentials: true },
    path: '/api/socket.io/',
  });

  io.on('connection', (socket) => {
    socket.join('public');

    socket.on('auth:join', ({ userId, role } = {}) => {
      if (userId) socket.join(`user:${userId}`);
      if (role === 'admin') socket.join('admin');
    });

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
