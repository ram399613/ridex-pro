const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const { emitAdminBookingUpdated, emitUserNotification } = require('../socket');

const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'cash'];
const paymentConfig = () => {
  const mode = process.env.PAYMENT_MODE || 'demo';
  const upiId = process.env.PAYMENT_UPI_ID || '8712134359@ybl';
  const merchantName = process.env.PAYMENT_MERCHANT_NAME || 'RideX Rentals';
  const bank = {
    name: process.env.PAYMENT_BANK_NAME || '', accountName: process.env.PAYMENT_ACCOUNT_NAME || '',
    accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || '', ifsc: process.env.PAYMENT_IFSC || '',
  };
  return { mode, upiId, merchantName, upiUri: upiId ? `upi://pay?${new URLSearchParams({ pa: upiId, pn: merchantName, cu: 'INR' }).toString()}` : '', bank, bankConfigured: Object.values(bank).every(Boolean) };
};

router.post('/initiate', protect, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    if (!mongoose.isValidObjectId(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });
    if (!PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ message: 'Unsupported payment method' });
    const booking = await Booking.findById(bookingId).populate('vehicle', 'name brand');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (!['pending', 'confirmed'].includes(booking.status) || booking.paymentStatus !== 'pending') return res.status(409).json({ message: 'This booking cannot be paid' });
    if (booking.paymentMethod === 'cash' && paymentMethod !== 'cash') return res.status(409).json({ message: 'This booking is set to cash on pickup' });
    const config = paymentConfig();
    res.json({
      bookingId: booking._id,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod,
      vehicle: booking.vehicle.name,
      ...config,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    if (!mongoose.isValidObjectId(bookingId)) return res.status(400).json({ message: 'Invalid booking ID' });
    if (!PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ message: 'Unsupported payment method' });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (['cancelled', 'completed'].includes(booking.status)) return res.status(400).json({ message: `Cannot pay for a ${booking.status} booking` });
    if (booking.paymentStatus === 'paid') return res.status(409).json({ message: 'This booking has already been paid' });
    if (booking.paymentStatus !== 'pending') return res.status(400).json({ message: 'This booking is not eligible for payment' });

    const config = paymentConfig();
    if (paymentMethod !== 'cash' && config.mode !== 'demo') return res.status(501).json({ message: 'Online payments are not configured. Please use cash on pickup or contact support.' });

    const update = paymentMethod === 'cash'
      ? { status: 'confirmed', paymentStatus: 'pending', paymentMethod: 'cash', transactionId: '' }
      : { status: 'confirmed', paymentStatus: 'paid', paymentMethod, transactionId: `DEMO_${Date.now()}` };
    const updated = await Booking.findOneAndUpdate(
      { _id: bookingId, user: req.user._id, status: { $nin: ['cancelled', 'completed'] }, paymentStatus: 'pending' },
      { $set: update }, { new: true }
    );
    if (!updated) return res.status(409).json({ message: 'Payment was already submitted or this booking changed' });

    emitAdminBookingUpdated(updated);
    emitUserNotification(updated.user.toString(), {
      type: 'success',
      message: paymentMethod === 'cash' ? `Booking ${updated.bookingId} confirmed. Payment is due at pickup.` : `Demo payment confirmed for booking ${updated.bookingId} 🎉`,
      bookingId: updated._id,
    });

    res.json({
      success: true,
      message: paymentMethod === 'cash' ? 'Booking confirmed. Payment is due at pickup.' : 'Demo payment successful! Your booking is confirmed.',
      booking: updated,
      transactionId: updated.transactionId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
