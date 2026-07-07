const express = require('express');
const router = express.Router();
const { emitAdminContact } = require('../socket');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const messages = [];

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

  emitAdminContact(entry);

  res.status(201).json({ success: true, message: 'Thanks! Your message has been sent. We will get back to you soon.' });
});

router.get('/', protect, adminOnly, (req, res) => {
  res.json(messages);
});

module.exports = router;
