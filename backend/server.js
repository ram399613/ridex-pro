const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { seedIfEmpty } = require('./seeder');

const app = express();
const server = http.createServer(app);

// Connect MongoDB, then auto-seed if empty.
(async () => {
  await connectDB();
  try { await seedIfEmpty(false); } catch (e) { console.error('Seed check failed:', e.message); }
})();

// Real-time layer (Socket.IO)
initSocket(server);

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({ origin: corsOrigin ? [corsOrigin] : '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'RideX API is running 🚀' }));

// ---- Serve React build (single-service deployment on Render) ----
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // SPA fallback — anything that isn't /api/* returns index.html so react-router works on refresh.
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
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
