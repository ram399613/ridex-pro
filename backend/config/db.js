const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri && process.env.NODE_ENV === 'production') {
    console.error('❌ MONGO_URI is missing in production environment variables!');
  }
  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/ridex', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️ Server will continue running, but database-dependent routes will return an error until MONGO_URI is configured correctly.');
  }
};

module.exports = connectDB;
