const express = require('express');
const router = express.Router();
const { emitAdminContact } = require('../socket');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// In-memory store is fine for a demo contact form (resets on server restart).
// Swap for a Mongoose model if you need it to persist.
const messages = [];

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  const entry = {
    id: Date.now().toString(36),
    name,
    email,
    subject: subject || 'General Enquiry',
    message,
    createdAt: new Date(),
  };
  messages.unshift(entry);

  // Live-push to any admin currently viewing the dashboard
  emitAdminContact(entry);

  res.status(201).json({ success: true, message: 'Thanks! Your message has been sent. We will get back to you soon.' });
});

// GET /api/contact (admin viewing history after a refresh)
router.get('/', protect, adminOnly, (req, res) => {
  res.json(messages);
});

module.exports = router;
