# RideX — React Edition (Single Service)

Full-stack vehicle rental platform. Node + Express + MongoDB + Socket.IO backend that also serves the React SPA — **one deploy, one URL, one bill**.

## Structure
```
backend/     Node/Express API + Socket.IO + serves frontend/build
frontend/    React SPA (Create React App)
render.yaml  One-click Render deploy blueprint (single web service)
```

---

## 🚀 One-click deploy to Render (single service)

1. **Push this repo to GitHub** (Emergent's "Save to GitHub" button, or `git push`).
2. **MongoDB Atlas** — create a free cluster ([atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)):
   - Database Access → add a user (username + password).
   - Network Access → allow `0.0.0.0/0`.
   - Databases → Connect → Drivers → copy the connection string:
     ```
     mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/ridex?retryWrites=true&w=majority
     ```
3. **Render dashboard** → **New +** → **Blueprint** → pick your repo. Render reads `render.yaml` and shows **one service**: `ridex`.
4. Paste your **`MONGO_URI`** when prompted (only manual value).
5. Click **Apply**. Render builds React + installs backend + starts the server (~4-6 min).
6. **Open the service URL** (e.g. `https://ridex.onrender.com`) → the home page loads.
   - The DB **auto-seeds** on first boot (admin, user, 16 vehicles) — no Shell needed.

### Demo logins
- Admin: `admin@ridex.com` / `admin123`
- User:  `ramu@example.com` / `test123`

### Coupon codes
`RIDE10` (10% off) · `RIDE20` (20% off) · `FIRST50` (50% off)

---

## 🛠 Local development

### Full-stack single-server mode
```bash
cd frontend && yarn install && yarn build   # produces frontend/build
cd ../backend && npm install
node server.js                              # http://localhost:8001
```

### Dev mode (hot reload)
Run backend and frontend separately:
```bash
# terminal 1
cd backend && npm install && npm run dev     # http://localhost:8001

# terminal 2
cd frontend
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn install && yarn start                    # http://localhost:3000
```

MongoDB must be reachable at `MONGO_URI` (defaults to `mongodb://localhost:27017/ridex`).

---

## 🧠 Notes

- **Auto-seed**: `seedIfEmpty()` runs at boot. If the DB already has users/vehicles it skips silently. To force a fresh seed run `node seeder.js` manually.
- **Payments are mocked** — `routes/payments.js` always succeeds. Swap for Stripe/Razorpay in production.
- **Contact messages** are stored in memory (reset on restart). Swap for a Mongoose model to persist.
- **Socket.IO** is mounted at `/api/socket.io/` so it flows through the same path prefix as the REST API — this keeps single-origin deployments and reverse proxies happy.
- **Free-tier cold starts** on Render sleep after 15 min of inactivity; first request wakes the service in ~30-60s.
