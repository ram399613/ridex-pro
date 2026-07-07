const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');
const { emitVehicleUpdated, emitAdminBookingNew, emitAdminBookingUpdated } = require('../socket');

// GET /api/bookings - User's bookings
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

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
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

// POST /api/bookings - Create booking
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, pickupLocation, dropLocation, pickupDate, returnDate, couponCode, notes } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!vehicle.available) return res.status(400).json({ message: 'Vehicle not available' });

    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);
    const totalDays = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24));
    if (totalDays < 1) return res.status(400).json({ message: 'Return date must be after pickup date' });

    let discount = 0;
    const baseAmount = vehicle.pricePerDay * totalDays;
    if (couponCode === 'RIDE10') discount = Math.round(baseAmount * 0.10);
    else if (couponCode === 'RIDE20') discount = Math.round(baseAmount * 0.20);
    else if (couponCode === 'FIRST50') discount = Math.round(baseAmount * 0.50);

    const totalAmount = baseAmount - discount;

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicleId,
      pickupLocation,
      dropLocation,
      pickupDate: pickup,
      returnDate: ret,
      totalDays,
      totalAmount,
      couponCode: couponCode || '',
      discount,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    await booking.populate('vehicle', 'name brand type pricePerDay images color');

    // Reserve the vehicle so nobody else can double-book it, and tell
    // every connected browser instantly (vehicles list / details page).
    vehicle.available = false;
    await vehicle.save();
    emitVehicleUpdated(vehicle);
    emitAdminBookingNew(booking);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
    await booking.save();

    // Free up the vehicle again and let everyone browsing know in real time.
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle && !vehicle.available) {
      vehicle.available = true;
      await vehicle.save();
      emitVehicleUpdated(vehicle);
    }
    emitAdminBookingUpdated(booking);

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
