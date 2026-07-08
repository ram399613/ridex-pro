# RideX

Vehicle rental platform — Node/Express + MongoDB + Socket.IO backend, React + Tailwind CSS frontend, single-service deployment.

## Structure
```
backend/     Node/Express API + Socket.IO + serves frontend/build
frontend/    React + Tailwind CSS SPA
render.yaml  Render Blueprint (single web service)
```

## One-click deploy to Render

1. Push repo to GitHub.
2. Create a free MongoDB Atlas cluster; whitelist `0.0.0.0/0`; copy the URI.
3. Render dashboard → New + → Blueprint → pick your repo.
4. Paste `MONGO_URI` when prompted.
5. Open the service URL — DB auto-seeds on first boot.

## Demo logins
- Admin: `admin@ridex.com` / `admin123`
- User: `ramu@example.com` / `test123`

## Coupon codes
`RIDE10` (10% off) · `RIDE20` (20% off) · `FIRST50` (50% off)

## Local dev

### Backend
```
cd backend
cp .env.example .env
npm install
node server.js
```

### Frontend
```
cd frontend
cp .env.example .env
yarn install
yarn start
```

MongoDB must be reachable at `MONGO_URI` (defaults to `mongodb://localhost:27017/ridex`).
