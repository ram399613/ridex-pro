const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { seedIfEmpty, migrateImages } = require('./seeder');

const app = express();
const server = http.createServer(app);

(async () => {
  await connectDB();
  try { await seedIfEmpty(false); } catch (e) { console.error('Seed check failed:', e.message); }
  try { await migrateImages(); } catch (e) { console.error('Image migration failed:', e.message); }
})();

const configuredOrigins = [process.env.CORS_ORIGIN, process.env.RENDER_EXTERNAL_URL].filter(Boolean).join(',')
  .split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const allowedOrigins = process.env.NODE_ENV === 'production' ? configuredOrigins : [...new Set([...configuredOrigins, ...localOrigins])];
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const cleaned = origin.replace(/\/$/, '');
  return allowedOrigins.includes('*') || allowedOrigins.includes(cleaned);
};
const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, origin || true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
};

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not set in environment variables! Using temporary fallback.');
  process.env.JWT_SECRET = 'ridex_fallback_secret_key_2025_render_deploy';
}

initSocket(server, corsOptions);

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'OK',
    dbConnected,
    message: dbConnected ? 'RideX API is running 🚀' : 'RideX API is running (MongoDB disconnected) ⚠️'
  });
});

const buildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(buildPath)) {

  app.use(express.static(buildPath, { index: false, maxAge: '1y' }));

  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) return next();
    if (req.path.includes('.')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  console.log(`📂 Serving frontend build from: ${buildPath}`);
} else {
  app.get('/', (req, res) => res.json({ status: 'OK', message: 'RideX API is running 🚀 (no frontend build found)' }));
}

const PORT = process.env.PORT || 8001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 RideX Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 API available at: http://0.0.0.0:${PORT}/api`);
  console.log(`⚡ Real-time (Socket.IO) ready\n`);
});
