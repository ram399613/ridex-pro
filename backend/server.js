const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();
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

initSocket(server);

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({ origin: corsOrigin ? [corsOrigin] : '*', credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'RideX API is running 🚀' }));

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
