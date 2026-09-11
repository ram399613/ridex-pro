const Vehicle = require('../models/Vehicle');

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'];

const isActiveBookingStatus = (status) => ACTIVE_BOOKING_STATUSES.includes(status);

// Vehicle availability is a single-resource lock in the current product model.
// Conditional updates make acquiring that lock safe when two requests arrive together.
const reserveVehicle = (vehicleId) => Vehicle.findOneAndUpdate(
  { _id: vehicleId, available: true },
  { $set: { available: false } },
  { new: true, runValidators: true }
);

const releaseVehicle = (vehicleId) => Vehicle.findByIdAndUpdate(
  vehicleId,
  { $set: { available: true } },
  { new: true, runValidators: true }
);

module.exports = { isActiveBookingStatus, reserveVehicle, releaseVehicle };
