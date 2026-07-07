const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  type: { type: String, enum: ['bike', 'car', 'scooter', 'luxury'], required: true },
  pricePerDay: { type: Number, required: true },
  images: [{ type: String }],
  description: { type: String, default: '' },
  specs: {
    engine: { type: String, default: '' },
    mileage: { type: String, default: '' },
    transmission: { type: String, default: 'Manual' },
    fuelType: { type: String, default: 'Petrol' },
    seats: { type: Number, default: 2 },
    power: { type: String, default: '' },
  },
  available: { type: Boolean, default: true },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  location: { type: String, default: 'Bangalore' },
  color: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
