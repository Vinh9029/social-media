const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  media: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['image', 'video'], 
    default: 'image' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 604800 // TTL index of 7 days (7 * 24 * 60 * 60 seconds) to automatically remove old stories! This is perfect!
  }
});

module.exports = mongoose.model('Story', StorySchema);
