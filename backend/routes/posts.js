const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username full_name avatar_url')
      .sort({ createdAt: -1 });

    // Enrich posts with comment counts and map to Frontend structure
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const commentsCount = await Comment.countDocuments({ post: post._id });
      
      // Kiểm tra an toàn nếu author bị null (ví dụ user đã bị xóa)
      const authorData = post.author ? {
        id: post.author._id,
        name: post.author.full_name,
        username: post.author.username,
        avatar: post.author.avatar_url
      } : {
        id: 'unknown',
        name: 'Người dùng ẩn danh',
        username: 'unknown',
        avatar: ''
      };

      return {
        id: post._id,
        author: authorData,
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
      author: req.user.id,
      title: req.body.title,
      content: req.body.content,
      image_url: req.body.image_url
    });

    const post = await newPost.save();
    await post.populate('author', 'username full_name avatar_url');

    res.json({
        id: post._id,
        author: {
          id: post.author._id,
          name: post.author.full_name,
          username: post.author.username,
          avatar: post.author.avatar_url
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
    const post = await Post.findById(req.params.id).populate('author', 'username full_name avatar_url');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    const commentsCount = await Comment.countDocuments({ post: post._id });
    
    const authorData = post.author ? {
      id: post.author._id,
      name: post.author.full_name,
      username: post.author.username,
      avatar: post.author.avatar_url
    } : {
      id: 'unknown',
      name: 'Unknown',
      username: 'unknown',
      avatar: ''
    };

    res.json({
      id: post._id,
      author: authorData,
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
      .populate('author', 'username full_name avatar_url')
      .sort({ createdAt: 1 });
      
    res.json(comments.map(comment => {
      const authorData = comment.author ? {
        id: comment.author._id,
        name: comment.author.full_name,
        username: comment.author.username,
        avatar: comment.author.avatar_url
      } : { id: 'unknown', name: 'Unknown', username: 'unknown', avatar: '' };

      return {
        id: comment._id,
        content: comment.content,
        author: authorData,
        timestamp: comment.createdAt,
        postId: comment.post,
        parentId: comment.parentId || null,
        likes: comment.likes || []
      };
    }));
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
      author: req.user.id,
      post: req.params.id,
      parentId: req.body.parentId || null,
      likes: []
    });
    
    await newComment.save();
    res.json(newComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Toggle Like Comment
router.post('/comments/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    if (!comment.likes) comment.likes = [];

    if (comment.likes.includes(req.user.id)) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
    } else {
      comment.likes.unshift(req.user.id);
    }

    await comment.save();
    res.json(comment.likes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete a comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
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