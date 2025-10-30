const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to find events matching user interests
EventSchema.statics.findMatchingEvents = async function(userInterests) {
  if (!userInterests || userInterests.length === 0) {
    return [];
  }
  
  // Create a regex pattern for each interest to match against title, description, or category
  const interestPatterns = userInterests.map(interest => {
    return new RegExp(interest, 'i');
  });
  
  // Find events that match any of the user's interests
  return this.find({
    $or: [
      { title: { $in: interestPatterns } },
      { description: { $in: interestPatterns } },
      { category: { $in: interestPatterns } }
    ]
  }).sort({ date: 1 });
};

module.exports = mongoose.model('Event', EventSchema);