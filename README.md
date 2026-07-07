# RideX — React Edition

Full-stack vehicle rental platform. Node.js + Express + MongoDB + Socket.IO backend, React SPA frontend.

## Structure
```
backend/     Node/Express API + MongoDB + Socket.IO
frontend/    React SPA (Create React App)
render.yaml  One-click Render deploy blueprint (both services)
```

---

## 🚀 One-click deploy to Render

1. **Push this repo to GitHub** (via Emergent's "Save to GitHub" button, or `git push`).
2. Create a **free MongoDB Atlas cluster** ([atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)):
   - Add IP `0.0.0.0/0` to Network Access
   - Copy the connection string (looks like `mongodb+srv://user:pass@cluster.xyz.mongodb.net/ridex?retryWrites=true&w=majority`)
3. In Render dashboard → **New +** → **Blueprint** → connect the repo.
4. Render reads `render.yaml` and provisions:
   - `ridex-backend` (Node web service on free tier)
   - `ridex-frontend` (Static site on free tier)
5. When prompted, paste your **MONGO_URI** (the only manual value).
6. Wait ~3-5 min for both services to build.
7. Open the backend URL once → visit `/api/health` → should return `{"status":"OK"}`.
8. **Seed the DB once** — in the `ridex-backend` service → **Shell** tab → run:
   ```
   node seeder.js
   ```
   This creates the demo admin + user + 16 vehicles.
9. Open the frontend URL — you're live 🎉

### Demo logins
- Admin: `admin@ridex.com` / `admin123`
- User:  `ramu@example.com` / `test123`

### Coupon codes
- `RIDE10` (10% off) · `RIDE20` (20% off) · `FIRST50` (50% off)

---

## 🛠 Local development

### Backend
```bash
cd backend
cp .env.example .env       # edit MONGO_URI if needed
npm install
node seeder.js             # seeds demo data
npm start                  # runs on PORT (default 8001)
```
Requires MongoDB running locally at `mongodb://localhost:27017/ridex`.

### Frontend
```bash
cd frontend
cp .env.example .env       # points to http://localhost:8001
yarn install
yarn start                 # runs on port 3000
```

---

## 🧠 Notes

- **Payments are mocked** (`routes/payments.js`) — always succeed. No real gateway.
- **Contact messages** are stored in memory in the backend and reset on restart.
- **Socket.IO** is mounted at `/api/socket.io/` so it goes through the same ingress path as the REST API. The React `SocketContext` connects on load, joins `public` (+ `user:<id>` + `admin` where relevant), and re-broadcasts as `CustomEvent`s.
- **Free-tier cold starts** — Render free web services sleep after 15 min of inactivity; the first request wakes them in ~30-60s.
- **CORS** — the backend reads `CORS_ORIGIN` env var; `render.yaml` auto-fills it with the frontend URL. Locally it defaults to `*`.
