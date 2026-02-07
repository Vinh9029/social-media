const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username full_name avatar_url')
      .sort({ createdAt: -1 });

    // Enrich posts with comment counts and map to Frontend structure
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const commentsCount = await Comment.countDocuments({ post: post._id });
      
      return {
        id: post._id,
        author: {
          id: post.user._id,
          name: post.user.full_name,
          username: post.user.username,
          avatar: post.user.avatar_url
        },
        content: post.content,
        image: post.image_url,
        likes: post.likes.length,
        comments: commentsCount,
        shares: 0,
        timestamp: post.createdAt,
        liked: false,
        title: post.title
      };
    }));

    res.json(postsWithCounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user.id,
      title: req.body.title,
      content: req.body.content,
      image_url: req.body.image_url
    });

    const post = await newPost.save();
    await post.populate('user', 'username full_name avatar_url');

    res.json({
        id: post._id,
        author: {
          id: post.user._id,
          name: post.user.full_name,
          username: post.user.username,
          avatar: post.user.avatar_url
        },
        content: post.content,
        image: post.image_url,
        likes: post.likes.length,
        comments: 0,
        shares: 0,
        timestamp: post.createdAt,
        liked: false,
        title: post.title
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Toggle Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.unshift(req.user.id);
    }

    await post.save();
    res.json(post.likes); 
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username full_name avatar_url');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    const commentsCount = await Comment.countDocuments({ post: post._id });
    
    res.json({
      id: post._id,
      author: {
        id: post.user._id,
        name: post.user.full_name,
        username: post.user.username,
        avatar: post.user.avatar_url
      },
      content: post.content,
      image: post.image_url,
      likes: post.likes.length,
      comments: commentsCount,
      shares: 0,
      timestamp: post.createdAt,
      liked: false,
      title: post.title
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server Error');
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'username full_name avatar_url')
      .sort({ createdAt: 1 });
      
    res.json(comments.map(comment => ({
      id: comment._id,
      content: comment.content,
      author: {
        id: comment.user._id,
        name: comment.user.full_name,
        username: comment.user.username,
        avatar: comment.user.avatar_url
      },
      timestamp: comment.createdAt,
      postId: comment.post
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const newComment = new Comment({
      content: req.body.content,
      user: req.user.id,
      post: req.params.id
    });
    
    await newComment.save();
    res.json(newComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.deleteOne();
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;