const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { emitVehicleUpdated, emitAdminBookingUpdated, emitUserNotification } = require('../socket');
const { isActiveBookingStatus, reserveVehicle, releaseVehicle } = require('../utils/bookingState');

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('vehicle', 'name brand type pricePerDay images')
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({ totalUsers, totalVehicles, totalBookings, confirmedBookings, pendingBookings, cancelledBookings, totalRevenue, recentBookings, monthlyRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('vehicle', 'name brand type pricePerDay images')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/bookings/:id', async (req, res) => {
  try {
    const previous = await Booking.findById(req.params.id);
    if (!previous) return res.status(404).json({ message: 'Booking not found' });
    const requestedStatus = req.body.status || previous.status;
    if (!BOOKING_STATUSES.includes(requestedStatus)) return res.status(400).json({ message: 'Invalid booking status' });
    const statusChanged = requestedStatus !== previous.status;
    let vehicle = null;

    if (statusChanged && !isActiveBookingStatus(previous.status) && isActiveBookingStatus(requestedStatus)) {
      vehicle = await reserveVehicle(previous.vehicle);
      if (!vehicle) return res.status(409).json({ message: 'Vehicle is not available for this booking status change' });
    }

    let booking;
    try {
      booking = await Booking.findByIdAndUpdate(req.params.id, { $set: { status: requestedStatus } }, { new: true, runValidators: true })
        .populate('vehicle', 'name brand type pricePerDay images')
        .populate('user', 'name email phone');
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
    } catch (error) {
      if (vehicle) await releaseVehicle(previous.vehicle);
      throw error;
    }

    if (statusChanged && isActiveBookingStatus(previous.status) && !isActiveBookingStatus(booking.status)) {
      vehicle = await releaseVehicle(previous.vehicle);
    }
    if (vehicle) {
      emitVehicleUpdated(vehicle);
    }

    emitAdminBookingUpdated(booking);
    if (statusChanged) {
      emitUserNotification(booking.user._id.toString(), {
        type: 'info',
        message: `Your booking ${booking.bookingId} is now "${booking.status}"`,
        bookingId: booking._id,
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
