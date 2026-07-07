const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { emitAdminBookingUpdated, emitUserNotification } = require('../socket');

router.post('/initiate', protect, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const booking = await Booking.findById(bookingId).populate('vehicle', 'name brand');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    res.json({
      bookingId: booking._id,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod,
      orderId: 'ORDER_' + Date.now(),
      vehicle: booking.vehicle.name,
      upiId: 'ridex@upi',
      merchantName: 'RideX Rentals',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { bookingId, transactionId, paymentMethod } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId || 'TXN_' + Date.now();
    await booking.save();

    emitAdminBookingUpdated(booking);
    emitUserNotification(booking.user.toString(), {
      type: 'success',
      message: `Payment confirmed for booking ${booking.bookingId} 🎉`,
      bookingId: booking._id,
    });

    res.json({
      success: true,
      message: 'Payment successful! Your booking is confirmed.',
      booking,
      transactionId: booking.transactionId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
