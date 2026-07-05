const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');

// Create a new Story
router.post('/', auth, async (req, res) => {
  try {
    const { media, type } = req.body;
    if (!media) {
      return res.status(400).json({ message: 'Story must have a media URL' });
    }

    const newStory = new Story({
      user: req.user.id,
      media,
      type: type || 'image'
    });

    const story = await newStory.save();
    await story.populate('user', 'full_name username avatar_url');

    res.json({
      id: story._id,
      user: {
        id: story.user._id,
        name: story.user.full_name,
        username: story.user.username,
        avatar: story.user.avatar_url
      },
      media: story.media,
      type: story.type,
      timestamp: story.createdAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Fetch active stories (within last 7 days)
router.get('/', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const stories = await Story.find({
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate('user', 'full_name username avatar_url')
      .sort({ createdAt: -1 });

    const formattedStories = stories.map(story => {
      const userData = story.user ? {
        id: story.user._id,
        name: story.user.full_name,
        username: story.user.username,
        avatar: story.user.avatar_url
      } : {
        id: 'unknown',
        name: 'Anonymous',
        username: 'unknown',
        avatar: ''
      };

      return {
        id: story._id,
        user: userData,
        media: story.media,
        type: story.type,
        timestamp: story.createdAt
      };
    });

    res.json(formattedStories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
