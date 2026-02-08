const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Follow / Unfollow User
router.put('/follow/:id', auth, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ msg: 'Bạn không thể follow chính mình' });
  }

  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Kiểm tra xem đã follow chưa
    if (targetUser.followers.includes(req.user.id)) {
      // Đã follow -> Thực hiện Unfollow
      await targetUser.updateOne({ $pull: { followers: req.user.id } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      res.json({ msg: 'Unfollowed', isFollowing: false });
    } else {
      // Chưa follow -> Thực hiện Follow
      await targetUser.updateOne({ $push: { followers: req.user.id } });
      await currentUser.updateOne({ $push: { following: req.params.id } });
      res.json({ msg: 'Followed', isFollowing: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;