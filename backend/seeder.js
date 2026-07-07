require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');
const { imageFor } = require('./vehicleImages');

const vehicles = [
  {
    name: 'Yamaha R15 V4', brand: 'Yamaha', type: 'bike', pricePerDay: 499,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yamaha%20R15%20v4%20bike.jpg'],
    description: 'The Yamaha R15 V4 is a high-performance sports bike with aerodynamic design and excellent handling.',
    specs: { engine: '155cc', mileage: '41 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '18.4 PS' },
    available: true, rating: 4.8, totalReviews: 52, color: 'Blue',
  },
  {
    name: 'Honda Activa 6G', brand: 'Honda', type: 'scooter', pricePerDay: 249,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Honda%20Activa%206G.jpg'],
    description: "Honda Activa 6G is India's most popular scooter with great fuel efficiency and comfort.",
    specs: { engine: '109cc', mileage: '60 kmpl', transmission: 'Automatic', fuelType: 'Petrol', seats: 2, power: '7.68 PS' },
    available: true, rating: 4.5, totalReviews: 38, color: 'White',
  },
  {
    name: 'Toyota Innova Crysta', brand: 'Toyota', type: 'car', pricePerDay: 1999,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Toyota%20Innova%20Crysta.jpg'],
    description: 'Toyota Innova Crysta is a premium MPV perfect for family trips and business travel.',
    specs: { engine: '2.4L Diesel', mileage: '15 kmpl', transmission: 'Manual', fuelType: 'Diesel', seats: 7, power: '148 PS' },
    available: true, rating: 4.7, totalReviews: 45, color: 'Silver',
  },
  {
    name: 'Royal Enfield Classic 350', brand: 'Royal Enfield', type: 'bike', pricePerDay: 699,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Royal%20Enfield%20Classic%20350%20(2017%20Model%20Year).jpg'],
    description: 'Royal Enfield Classic 350 – the iconic thumper with timeless styling and road presence.',
    specs: { engine: '349cc', mileage: '35 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '20.2 PS' },
    available: true, rating: 4.6, totalReviews: 67, color: 'Black',
  },
  {
    name: 'Maruti Swift', brand: 'Maruti', type: 'car', pricePerDay: 999,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Maruti%20Suzuki%20Swift%202098.JPG'],
    description: 'Maruti Swift is a fun-to-drive hatchback, perfect for city commutes and weekend getaways.',
    specs: { engine: '1.2L Petrol', mileage: '23 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 5, power: '88 PS' },
    available: true, rating: 4.3, totalReviews: 89, color: 'Red',
  },
  {
    name: 'KTM Duke 200', brand: 'KTM', type: 'bike', pricePerDay: 599,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/KTM%20DUKE%20200%20front.JPG'],
    description: 'KTM Duke 200 – a ready-to-race street naked bike with aggressive styling.',
    specs: { engine: '199cc', mileage: '35 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '25 PS' },
    available: true, rating: 4.7, totalReviews: 41, color: 'Orange',
  },
  {
    name: 'BMW 5 Series', brand: 'BMW', type: 'luxury', pricePerDay: 4999,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/BMW%205%20Series%20G30%20black%20(1).jpg'],
    description: 'BMW 5 Series – the ultimate driving machine. Luxury, performance, and sophistication combined.',
    specs: { engine: '2.0L Turbo', mileage: '13 kmpl', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, power: '252 PS' },
    available: true, rating: 4.9, totalReviews: 23, color: 'Black',
  },
  {
    name: 'TVS Jupiter', brand: 'TVS', type: 'scooter', pricePerDay: 199,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/TVS%20Jupiter.jpg'],
    description: 'TVS Jupiter – the smarter scooter built for comfort and fuel efficiency.',
    specs: { engine: '109cc', mileage: '62 kmpl', transmission: 'Automatic', fuelType: 'Petrol', seats: 2, power: '7.77 PS' },
    available: true, rating: 4.2, totalReviews: 55, color: 'Blue',
  },
  {
    name: 'Mercedes-Benz E-Class', brand: 'Mercedes', type: 'luxury', pricePerDay: 6999,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz%20W213%20E-Class%202016.jpg'],
    description: 'Mercedes-Benz E-Class – an icon of luxury and engineering excellence.',
    specs: { engine: '2.0L Turbo', mileage: '12 kmpl', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, power: '197 PS' },
    available: true, rating: 4.9, totalReviews: 18, color: 'Silver',
  },
  {
    name: 'Honda CB Hornet 160R', brand: 'Honda', type: 'bike', pricePerDay: 399,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/2017%20Honda%20CB%20Hornet%20160R%20-%20Howrah%2020170610103542.jpg'],
    description: 'Honda CB Hornet 160R – sporty design with powerful performance for everyday thrills.',
    specs: { engine: '160cc', mileage: '45 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '17.03 PS' },
    available: true, rating: 4.4, totalReviews: 33, color: 'Matte Grey',
  },
  {
    name: 'Bajaj Pulsar 150', brand: 'Bajaj', type: 'bike', pricePerDay: 449,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Bajaj%20Pulsar%20150,%202003.jpg'],
    description: 'Bajaj Pulsar 150 – India\'s original performance icon, blending punchy power with everyday comfort.',
    specs: { engine: '149.5cc', mileage: '45 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '14 PS' },
    available: true, rating: 4.4, totalReviews: 61, color: 'Black',
  },
  {
    name: 'Suzuki Access 125', brand: 'Suzuki', type: 'scooter', pricePerDay: 279,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Suzuki%20access%20125.jpg'],
    description: 'Suzuki Access 125 – a premium scooter with a powerful engine, spacious seat and refined ride quality.',
    specs: { engine: '124cc', mileage: '48 kmpl', transmission: 'Automatic', fuelType: 'Petrol', seats: 2, power: '8.7 PS' },
    available: true, rating: 4.5, totalReviews: 29, color: 'Grey',
  },
  {
    name: 'Hero Splendor XTEC', brand: 'Hero', type: 'bike', pricePerDay: 229,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Hero%20Splendor%20XTEC%202022.png'],
    description: 'Hero Splendor XTEC – the world\'s most trusted commuter bike, built for reliability and mileage.',
    specs: { engine: '97.2cc', mileage: '65 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 2, power: '8.02 PS' },
    available: true, rating: 4.5, totalReviews: 74, color: 'Red',
  },
  {
    name: 'Hyundai Creta', brand: 'Hyundai', type: 'car', pricePerDay: 2499,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai%20Creta.jpg'],
    description: 'Hyundai Creta – a stylish and feature-loaded compact SUV, great for both city driving and highway trips.',
    specs: { engine: '1.5L Petrol', mileage: '16.8 kmpl', transmission: 'Automatic', fuelType: 'Petrol', seats: 5, power: '115 PS' },
    available: true, rating: 4.6, totalReviews: 37, color: 'White',
  },
  {
    name: 'Tata Nexon', brand: 'Tata', type: 'car', pricePerDay: 1799,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tata%20Nexon%20Blue%20Dual%20Tone.jpg'],
    description: 'Tata Nexon – a rugged, 5-star safety rated compact SUV with bold styling and a comfortable cabin.',
    specs: { engine: '1.2L Turbo Petrol', mileage: '17.4 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 5, power: '120 PS' },
    available: true, rating: 4.5, totalReviews: 42, color: 'Blue',
  },
  {
    name: 'Mahindra Thar', brand: 'Mahindra', type: 'car', pricePerDay: 2999,
    images: ['https://commons.wikimedia.org/wiki/Special:FilePath/Mahindra%20Thar%20in%20maroon,%20rear%20right.jpg'],
    description: 'Mahindra Thar – a go-anywhere off-roader with a convertible top, perfect for adventure trips.',
    specs: { engine: '2.0L Turbo Petrol', mileage: '12 kmpl', transmission: 'Manual', fuelType: 'Petrol', seats: 4, power: '150 PS' },
    available: true, rating: 4.6, totalReviews: 30, color: 'Maroon',
  },
];

const seedDB = async () => {
  await connectDB();
  await seedIfEmpty(true); // force clear + seed when run directly
  process.exit(0);
};

// Reusable seed function — used on-boot from server.js.
// Runs only if the DB is empty (unless force=true).
const seedIfEmpty = async (force = false) => {
  try {
    const existingUsers = await User.countDocuments();
    const existingVehicles = await Vehicle.countDocuments();
    if (!force && (existingUsers > 0 || existingVehicles > 0)) {
      console.log(`ℹ️  Skipping seed (already have ${existingUsers} users, ${existingVehicles} vehicles).`);
      return;
    }

    if (force) {
      await User.deleteMany({});
      await Vehicle.deleteMany({});
      await Booking.deleteMany({});
      console.log('🗑️  Cleared existing data');
    }

    const admin = await User.create({
      name: 'Admin RideX', email: 'admin@ridex.com', password: 'admin123',
      phone: '+91 9876543210', role: 'admin',
    });
    const user = await User.create({
      name: 'Ramu Reddy', email: 'ramu@example.com', password: 'test123',
      phone: '+91 9876543210', role: 'user',
    });
    console.log(`👤 Created admin: ${admin.email}`);
    console.log(`👤 Created user:  ${user.email}`);

    // Apply fast Unsplash CDN images at insertion time.
    const vehiclesWithFastImages = vehicles.map(v => ({ ...v, images: [imageFor(v)] }));
    const createdVehicles = await Vehicle.insertMany(vehiclesWithFastImages);
    console.log(`🚗 Created ${createdVehicles.length} vehicles`);

    const bookings = [
      { user: user._id, vehicle: createdVehicles[0]._id, pickupLocation: 'Koramangala, Bangalore', dropLocation: 'Koramangala, Bangalore', pickupDate: new Date('2025-05-21'), returnDate: new Date('2025-05-23'), totalDays: 2, totalAmount: 998, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'upi' },
      { user: user._id, vehicle: createdVehicles[1]._id, pickupLocation: 'Indiranagar, Bangalore', dropLocation: 'Indiranagar, Bangalore', pickupDate: new Date('2025-05-20'), returnDate: new Date('2025-05-21'), totalDays: 1, totalAmount: 249, status: 'completed', paymentStatus: 'paid', paymentMethod: 'card' },
      { user: user._id, vehicle: createdVehicles[4]._id, pickupLocation: 'HSR Layout, Bangalore', dropLocation: 'HSR Layout, Bangalore', pickupDate: new Date('2025-05-15'), returnDate: new Date('2025-05-16'), totalDays: 1, totalAmount: 999, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'card' },
      { user: user._id, vehicle: createdVehicles[2]._id, pickupLocation: 'MG Road, Bangalore', dropLocation: 'Airport, Bangalore', pickupDate: new Date('2025-06-01'), returnDate: new Date('2025-06-03'), totalDays: 2, totalAmount: 3998, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'netbanking' },
    ];
    await Booking.insertMany(bookings);
    console.log(`📋 Created ${bookings.length} sample bookings`);

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin:  admin@ridex.com  / admin123');
    console.log('📧 User:   ramu@example.com / test123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    if (require.main === module) process.exit(1);
  }
};

// One-off migration: replace slow Wikimedia URLs (and any other legacy image
// URLs) with fast Unsplash CDN URLs. Runs on every boot and only touches
// vehicles whose images actually need updating.
const migrateImages = async () => {
  try {
    const legacyRe = /(wikimedia|Special:FilePath)/i;
    const all = await Vehicle.find({});
    let touched = 0;
    for (const v of all) {
      const current = v.images?.[0] || '';
      const desired = imageFor(v);
      if (!current || legacyRe.test(current) || current !== desired) {
        v.images = [desired];
        await v.save();
        touched += 1;
      }
    }
    if (touched > 0) console.log(`🖼️  Migrated ${touched} vehicle image(s) to Unsplash CDN`);
  } catch (err) {
    console.error('Image migration failed:', err.message);
  }
};

module.exports = { seedIfEmpty, migrateImages };

if (require.main === module) seedDB();
