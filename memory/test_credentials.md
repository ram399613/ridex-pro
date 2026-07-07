# RideX Test Credentials

## Demo Accounts (created by backend/seeder.js)

- **Admin**
  - Email: `admin@ridex.com`
  - Password: `admin123`

- **User**
  - Email: `ramu@example.com`
  - Password: `test123`

## Frontend URL
`https://8150c96b-0fd6-4497-a60d-7aa943c85b1b.preview.emergentagent.com`

## Backend base URL
`https://8150c96b-0fd6-4497-a60d-7aa943c85b1b.preview.emergentagent.com/api`

## Notes
- Coupon codes for booking: `RIDE10` (10% off), `RIDE20` (20% off), `FIRST50` (50% off)
- Payment methods available: UPI, Card, Netbanking, Cash on pickup — all mocked, always succeed
- Socket.IO real-time layer runs at path `/api/socket.io/`
- Reseed the DB anytime with: `cd /app/backend && node seeder.js`
