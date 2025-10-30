const express = require('express');
const { getMatchingEvents, getRecommendations } = require('../controllers/matches');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get events matching user interests
router.get('/', protect, getMatchingEvents);

// Get recommended events
router.get('/recommendations', protect, getRecommendations);

module.exports = router;