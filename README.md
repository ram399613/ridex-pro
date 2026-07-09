# RideX Pro - Premium Vehicle Rental Platform

RideX Pro is a full-stack, responsive vehicle rental platform that allows users to easily browse, book, and manage vehicle rentals. It supports bikes, scooters, cars, and luxury vehicles. Built with modern web technologies, it features real-time updates and a seamless user experience.

## 🔗 Quick Links
- **Live Demo**: [https://ridex-pro.onrender.com/](https://ridex-pro.onrender.com/)
- **GitHub Repository**: [https://github.com/ram399613/ridex-pro](https://github.com/ram399613/ridex-pro)

## ✨ Key Features
- **User Authentication**: Secure login and registration using JWT.
- **Vehicle Catalog**: Browse a wide variety of vehicles with dynamic filtering and sorting.
- **Real-time Bookings**: Book vehicles seamlessly with conflict prevention.
- **Admin Dashboard**: Manage vehicles, bookings, and users via a comprehensive admin panel.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices.

## 🛠️ Technology Stack
- **Frontend**: React, Tailwind CSS, FontAwesome, React Router
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB (Mongoose ORM)
- **Deployment**: Render Blueprint

## 🏗️ Project Structure
```text
ridex-pro/
├── backend/       # Node/Express API + Socket.IO server
│   ├── config/    # Database connection setup
│   ├── middleware/# Custom middleware (e.g., auth, error handling)
│   ├── models/    # Mongoose data schemas (User, Vehicle, Booking)
│   ├── routes/    # Express REST API routes
│   ├── seeder.js  # Script to populate DB with initial mock data
│   ├── server.js  # Main application entry point & logic
│   └── socket.js  # Real-time WebSockets logic
├── frontend/      # React + Tailwind CSS Single Page Application
│   ├── public/    # Static assets (HTML, icons, fonts)
│   ├── src/       # React components, pages, styles, and context
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Full-page view components
│   │   └── styles/     # Tailwind index & global CSS
│   └── package.json # Frontend dependencies and scripts
├── .gitignore     # Files ignored by Git (like node_modules, .env)
├── .gitconfig     # Project-specific Git configuration
└── render.yaml    # Render Blueprint for fully automated CI/CD deployments
```

## 🚀 One-Click Deploy to Render

1. Push this repository to GitHub.
2. Create a free MongoDB Atlas cluster, whitelist `0.0.0.0/0`, and copy your connection URI.
3. Go to your Render Dashboard → **New +** → **Blueprint** → Select this repository.
4. Paste your `MONGO_URI` when prompted.
5. Once deployed, open the service URL. The database will automatically seed with sample data on the first boot.

## 🔐 Demo Credentials
The application automatically seeds an admin and a regular user account for testing purposes.

- **Admin Account**: `admin@ridex.com` / `admin123`
- **User Account**: `ramu@example.com` / `test123`

## 🎟️ Promotional Coupons
You can use the following coupon codes during checkout for discounts:
- `RIDE10` (10% off)
- `RIDE20` (20% off)
- `FIRST50` (50% off)

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/ram399613/ridex-pro.git
cd ridex-pro
```

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```
*Note: Make sure your `.env` file is set up with your `MONGO_URI`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The React application will start on `http://localhost:3000` and will proxy API requests to your backend running on `http://localhost:8001`.

## 📄 License
This project is for educational and portfolio purposes.
