const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const { emitVehicleUpdated, emitAdminBookingNew, emitAdminBookingUpdated } = require('../socket');
const { reserveVehicle, releaseVehicle } = require('../utils/bookingState');

const COUPONS = { RIDE10: 0.10, RIDE20: 0.20, FIRST50: 0.50 };
const DAY_MS = 24 * 60 * 60 * 1000;

const parseBookingDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle', 'name brand type pricePerDay images color')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID' });
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, pickupLocation, dropLocation, pickupDate, returnDate, couponCode, notes } = req.body;
    if (!vehicleId || !mongoose.isValidObjectId(vehicleId) || !pickupLocation?.trim() || !dropLocation?.trim()) return res.status(400).json({ message: 'Pickup location, drop location, and a valid vehicle are required' });
    const pickup = parseBookingDate(pickupDate);
    const ret = parseBookingDate(returnDate);
    if (!pickup || !ret) return res.status(400).json({ message: 'Please provide valid pickup and return dates' });
    const todayBoundary = new Date();
    todayBoundary.setHours(0, 0, 0, 0);
    todayBoundary.setDate(todayBoundary.getDate() - 1);
    if (pickup < todayBoundary) return res.status(400).json({ message: 'Pickup date cannot be in the past' });
    const totalDays = Math.ceil((ret - pickup) / DAY_MS);
    if (totalDays < 1) return res.status(400).json({ message: 'Return date must be after pickup date' });

    const vehicle = await reserveVehicle(vehicleId);
    if (!vehicle) return res.status(409).json({ message: 'Vehicle is no longer available' });

    let discount = 0;
    const baseAmount = vehicle.pricePerDay * totalDays;
    const normalizedCoupon = String(couponCode || '').trim().toUpperCase();
    if (normalizedCoupon && !COUPONS[normalizedCoupon]) {
      await releaseVehicle(vehicleId);
      return res.status(400).json({ message: 'Invalid coupon code' });
    }
    if (normalizedCoupon) discount = Math.round(baseAmount * COUPONS[normalizedCoupon]);

    const totalAmount = baseAmount - discount;

    let booking;
    try {
      booking = await Booking.create({
        user: req.user._id, vehicle: vehicleId, pickupLocation: pickupLocation.trim(), dropLocation: dropLocation.trim(),
        pickupDate: pickup, returnDate: ret, totalDays, totalAmount, couponCode: normalizedCoupon,
        discount, notes: String(notes || '').trim(), status: 'pending', paymentStatus: 'pending',
      });
    } catch (error) {
      await releaseVehicle(vehicleId);
      throw error;
    }

    await booking.populate('vehicle', 'name brand type pricePerDay images color');

    emitVehicleUpdated(vehicle);
    emitAdminBookingNew(booking);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid booking ID' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
    await booking.save();

    const vehicle = await releaseVehicle(booking.vehicle);
    if (vehicle) {
      emitVehicleUpdated(vehicle);
    }
    emitAdminBookingUpdated(booking);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
