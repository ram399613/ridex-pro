const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { emitVehicleCreated, emitVehicleUpdated, emitVehicleDeleted } = require('../socket');

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { type, brand, minPrice, maxPrice, search, sort, available } = req.query;
    let query = {};
    if (type && type !== 'all') query.type = type;
    if (brand && brand !== 'all') query.brand = new RegExp(brand, 'i');
    if (available !== undefined) query.available = available === 'true';
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') },
      ];
    }
    let sortObj = {};
    if (sort === 'price_asc') sortObj.pricePerDay = 1;
    else if (sort === 'price_desc') sortObj.pricePerDay = -1;
    else if (sort === 'rating') sortObj.rating = -1;
    else sortObj.createdAt = -1;

    const vehicles = await Vehicle.find(query).sort(sortObj);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/vehicles (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    emitVehicleCreated(vehicle);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/vehicles/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    emitVehicleUpdated(vehicle);
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/vehicles/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    emitVehicleDeleted(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
