# RideX — React Edition

Full-stack vehicle rental platform. Backend is Node.js + Express + MongoDB + Socket.IO; frontend is a full React SPA (converted from the original vanilla HTML/JS).

## Structure
```
backend/     Node/Express API + MongoDB + Socket.IO
  server.js
  seeder.js
  socket.js         (Socket.IO mounted at path /api/socket.io/)
  config/db.js
  middleware/{auth,admin}.js
  models/{User,Vehicle,Booking}.js
  routes/{auth,vehicles,bookings,payments,admin,contact}.js
  .env              (MONGO_URI, JWT_SECRET, PORT)

frontend/    React SPA (create-react-app)
  src/
    App.js
    index.js
    context/{AuthContext,SocketContext,ToastContext}.js
    services/api.js
    components/{Navbar,Footer,LiveBadge,ToastContainer,VehicleCard}.js
    pages/{Home,Vehicles,VehicleDetails,Login,Register,Booking,Payment,MyBookings,Dashboard,Admin,Contact}.js
    styles/index.css
  public/index.html
  .env              (REACT_APP_BACKEND_URL)
```

## Setup

### 1. Backend
```bash
cd backend
npm install
node seeder.js       # seeds admin + user + 16 vehicles + 4 sample bookings
npm start            # starts on PORT (defaults to 8001; original demo used 5000)
```

Requires MongoDB running at `MONGO_URI` (defaults to `mongodb://localhost:27017/ridex`).

### 2. Frontend
```bash
cd frontend
yarn install
# set REACT_APP_BACKEND_URL in .env to point at the backend origin
yarn start           # runs on port 3000
```

## Demo logins (from seeder)
- Admin: `admin@ridex.com` / `admin123`
- User:  `ramu@example.com` / `test123`

## Coupon codes
- `RIDE10` → 10% off
- `RIDE20` → 20% off
- `FIRST50` → 50% off

## Real-time layer
Socket.IO is mounted at `/api/socket.io/` (so it goes through the same `/api` ingress path as the REST API). The React `SocketContext` connects on app load, joins `public` (+ `user:<id>` and `admin` if applicable), and re-broadcasts events as `CustomEvent`s (`ridex:vehicle-updated`, `ridex:notification`, `ridex:admin-refresh`, etc.). A small "● Live" badge (bottom-left) shows connection status.

## Notes
- Payments are fully mocked (`routes/payments.js`) — no real gateway.
- Contact messages are stored in memory (reset on backend restart).
- Vehicle images use Wikimedia hotlinks; some may return 403 depending on the client — replace freely in `seeder.js`.
