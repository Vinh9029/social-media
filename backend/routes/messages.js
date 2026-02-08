const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Gửi tin nhắn
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    // Check blocking
    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (sender.blocked_users.includes(recipientId) || recipient.blocked_users.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Không thể gửi tin nhắn cho người dùng này' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content
    });
    const savedMessage = await newMessage.save();
    await savedMessage.populate('sender', 'username full_name avatar_url');
    await savedMessage.populate('recipient', 'username full_name avatar_url');
    res.json(savedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Lấy danh sách các cuộc trò chuyện
router.get('/conversations', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'username full_name avatar_url')
    .populate('recipient', 'username full_name avatar_url');

    const conversations = [];
    const seenUsers = new Set();

    messages.forEach(msg => {
      const isSender = msg.sender._id.toString() === req.user.id;
      const partner = isSender ? msg.recipient : msg.sender;
      if(!partner) return;
      const partnerId = partner._id.toString();

      if (!seenUsers.has(partnerId)) {
        seenUsers.add(partnerId);
        conversations.push({
          partnerId: partnerId,
          username: partner.username,
          name: partner.full_name,
          avatar: partner.avatar_url,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          read: msg.read,
          isSender: isSender
        });
      }
    });

    // Filter if query exists
    if (q) {
      const regex = new RegExp(q, 'i');
      const filtered = conversations.filter(c => regex.test(c.name) || regex.test(c.lastMessage));
      res.json(filtered);
    } else {
      res.json(conversations);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Lấy tin nhắn với một user cụ thể
router.get('/:partnerId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.partnerId },
        { sender: req.params.partnerId, recipient: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username full_name avatar_url')
    .populate('recipient', 'username full_name avatar_url');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;