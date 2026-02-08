const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { type: String, required: true },
  image_url: { type: String },
  title: { type: String }, // Optional title
  
  // Interactions
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Comments sẽ được query từ collection Comment, nhưng có thể cache số lượng nếu cần
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);