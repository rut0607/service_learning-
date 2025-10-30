const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get events matching user interests
// @route   GET /api/matches
// @access  Private
exports.getMatchingEvents = async (req, res) => {
  try {
    // Get the current user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find events matching user interests
    const matchingEvents = await Event.findMatchingEvents(user.interests);
    
    res.json({
      success: true,
      count: matchingEvents.length,
      data: matchingEvents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recommended events based on user interests
// @route   GET /api/matches/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    // Get the current user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get upcoming events (events with dates in the future)
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() }
    }).sort({ date: 1 });
    
    // Score each event based on how well it matches user interests
    const scoredEvents = upcomingEvents.map(event => {
      let score = 0;
      const eventText = `${event.title} ${event.description} ${event.category}`.toLowerCase();
      
      // Increase score for each interest that appears in the event
      user.interests.forEach(interest => {
        const interestRegex = new RegExp(interest.toLowerCase(), 'i');
        if (interestRegex.test(eventText)) {
          score += 1;
        }
      });
      
      return {
        event,
        score
      };
    });
    
    // Sort by score (highest first) and return top 5
    const recommendations = scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.event);
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};