const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // Ensure we require Comment model

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    let commentCount = 0;
    if (Comment) {
      commentCount = await Comment.countDocuments();
    }
    
    res.json({
      users: userCount,
      posts: postCount,
      comments: commentCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users (excluding admins as per request)
// @access  Private/Admin
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    // Map to frontend expected format
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.full_name || user.username,
      username: user.username,
      email: user.email,
      avatar: user.avatar_url,
      role: user.role,
      bio: user.bio,
      status: user.status
    }));
    res.json(formattedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/posts
// @desc    Get recent posts
// @access  Private/Admin
router.get('/posts', auth, adminAuth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username full_name avatar_url').sort({ createdAt: -1 });
    const formattedPosts = posts.map(post => ({
      id: post.id,
      author: {
        id: post.author?.id || 'unknown',
        name: post.author?.full_name || post.author?.username || 'Người dùng ẩn danh',
        username: post.author?.username || 'unknown',
        avatar: post.author?.avatar_url || ''
      },
      content: post.content,
      title: post.title,
      likes: post.reactions ? post.reactions.length : 0,
      comments: 0, // This could be aggregated if we want exact numbers, mock for now
      timestamp: post.createdAt
    }));
    res.json(formattedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/comments
// @desc    Get recent comments
// @access  Private/Admin
router.get('/comments', auth, adminAuth, async (req, res) => {
  try {
    if (!Comment) return res.json([]);
    const comments = await Comment.find().populate('author', 'username full_name avatar_url').populate('postId', 'title content').sort({ createdAt: -1 });
    const formattedComments = comments.map(c => ({
      id: c.id,
      content: c.content,
      author: {
        id: c.author?.id || 'unknown',
        name: c.author?.full_name || c.author?.username || 'Người dùng ẩn danh',
        username: c.author?.username || 'unknown',
        avatar: c.author?.avatar_url || ''
      },
      timestamp: c.createdAt,
      postId: c.postId?.id,
      postTitle: c.postId?.title || c.postId?.content?.substring(0, 30) || 'Bài viết ẩn danh'
    }));
    res.json(formattedComments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/status
// @desc    Toggle user active/deactivated status
// @access  Private/Admin
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate yourself' });
    }

    user.status = user.status === 'deactivated' ? 'active' : 'deactivated';
    await user.save();
    
    res.json({ message: 'User status updated', status: user.status });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ author: req.params.id });
    if(Comment) await Comment.deleteMany({ author: req.params.id });
    
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/posts/:id
// @desc    Delete post
// @access  Private/Admin
router.delete('/posts/:id', auth, adminAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    await Post.findByIdAndDelete(req.params.id);
    if(Comment) await Comment.deleteMany({ postId: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/comments/:id
// @desc    Delete comment
// @access  Private/Admin
router.delete('/comments/:id', auth, adminAuth, async (req, res) => {
  try {
    if(!Comment) return res.status(400).json({message: "No comment model"});
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
