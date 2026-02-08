const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

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

// Toggle Save Post
router.put('/save/:postId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;

    // Kiểm tra xem đã lưu chưa
    if (user.saved_posts.includes(postId)) {
      // Đã lưu -> Bỏ lưu
      await user.updateOne({ $pull: { saved_posts: postId } });
      res.json({ msg: 'Unsaved', isSaved: false });
    } else {
      // Chưa lưu -> Lưu (đưa lên đầu mảng)
      // Dùng $pull trước để đảm bảo không trùng, sau đó $push với $position 0
      await user.updateOne({ $pull: { saved_posts: postId } });
      await user.updateOne({ $push: { saved_posts: { $each: [postId], $position: 0 } } });
      res.json({ msg: 'Saved', isSaved: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Saved Posts
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'saved_posts',
      populate: {
        path: 'author',
        select: 'username full_name avatar_url'
      }
    });

    res.json(user.saved_posts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Block User
router.put('/block/:id', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetId = req.params.id;

    if (!currentUser.blocked_users.includes(targetId)) {
      await currentUser.updateOne({ $push: { blocked_users: targetId } });
    }
    res.json({ msg: 'User blocked' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Unblock User
router.put('/unblock/:id', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetId = req.params.id;

    await currentUser.updateOne({ $pull: { blocked_users: targetId } });
    res.json({ msg: 'User unblocked' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;