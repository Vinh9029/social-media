const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, default: '' },
  image: { type: String, default: '' },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['👍', '❤️', '😂', '😮', '😢', '😡'] } // Like, Love, Haha, Wow, Sad, Angry
    }
  ],
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);