const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { eventValidation, validateRequest } = require('../middleware/validators');
const { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/events');
const { sendEmail } = require('../utils/emailService');
const User = require('../models/User');

const router = express.Router();

// Get all events - Public
router.get('/', getEvents);

// Get event by ID - Public
router.get('/:id', getEvent);

// Create new event - Admin only
router.post(
  '/', 
  protect, 
  authorize('admin'), 
  eventValidation,
  validateRequest,
  createEvent
);

// Update event - Admin only
router.put(
  '/:id', 
  protect, 
  authorize('admin'),
  eventValidation,
  validateRequest,
  updateEvent
);

// Delete event - Admin only
router.delete(
  '/:id', 
  protect, 
  authorize('admin'), 
  deleteEvent
);

// Send notifications about events
router.post('/notifications/send', protect, async (req, res) => {
  try {
    const { title, date, message, notifyAll, interests } = req.body;
    
    if (!title || !date || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Query to find users based on criteria
    let query = {};
    if (!notifyAll && interests && interests.length > 0) {
      query.interests = { $in: interests };
    }
    
    const users = await User.find(query);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching the criteria' });
    }
    
    // Send emails to all matching users
    const emailPromises = users.map(user => {
      const emailContent = `
        <h2>Event Notification: ${title}</h2>
        <p>Hello ${user.name},</p>
        <p>We wanted to inform you about an upcoming event:</p>
        <p><strong>Event:</strong> ${title}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Details:</strong> ${message}</p>
        <p>We hope to see you there!</p>
        <p>Best regards,<br>NGO Team</p>
      `;
      
      return sendEmail(
        user.email,
        `Event Notification: ${title}`,
        emailContent
      ).catch(err => {
        console.error(`Failed to send email to ${user.email}:`, err);
        return null; // Continue with other emails even if one fails
      });
    });
    
    await Promise.all(emailPromises);
    
    res.status(200).json({ 
      message: 'Notifications sent successfully', 
      userCount: users.length 
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;