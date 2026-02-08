const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, full_name } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      full_name,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name || username)}&background=random`
    });

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      // Mapping response to match Frontend User interface
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username, 
          email, 
          name: full_name, // Map full_name -> name
          role: user.role,
          avatar: user.avatar_url, // Map avatar_url -> avatar
          cover: user.cover_url // Map cover_url -> cover
        } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email, 
          name: user.full_name, 
          role: user.role, 
          avatar: user.avatar_url,
          bio: user.bio,
          cover: user.cover_url
        } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Current User
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    // Map response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.full_name,
      role: user.role,
      avatar: user.avatar_url,
      bio: user.bio,
      cover: user.cover_url
    };
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Change Password
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update User Profile
router.put('/update', auth, async (req, res) => {
  try {
    const { name, bio, avatar, cover, github, facebook, linkedin } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.full_name = name;
    if (bio) userFields.bio = bio;
    if (avatar) userFields.avatar_url = avatar;
    if (cover) userFields.cover_url = cover;
    if (github) userFields.github = github;
    if (facebook) userFields.facebook = facebook;
    if (linkedin) userFields.linkedin = linkedin;

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    // Map response to match Frontend User interface
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.full_name,
      role: user.role,
      avatar: user.avatar_url,
      bio: user.bio,
      cover: user.cover_url,
      github: user.github,
      facebook: user.facebook,
      linkedin: user.linkedin
    };

    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- OAUTH IMPLEMENTATION ---

// 1. Google Login
router.get('/google', (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' '),
  };
  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });
    const { access_token } = await tokenRes.json();

    // Get User Info
    const userRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`);
    const googleUser = await userRes.json();

    // Find or Create User
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = new User({
        username: googleUser.email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: googleUser.email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        full_name: googleUser.name,
        avatar_url: googleUser.picture,
      });
      await user.save();
    }

    // Generate Token & Redirect
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.redirect(`${clientUrl}/login?token=${token}`);
    });
  } catch (err) {
    console.error(err);
    res.redirect(`${clientUrl}/login?error=GoogleLoginFailed`);
  }
});

// 2. GitHub Login (Simplified)
router.get('/github', (req, res) => {
  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    scope: 'user:email',
  };
  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
});

router.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) throw new Error(tokenData.error_description);

    // Get User Info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const githubUser = await userRes.json();

    // Get Email (GitHub often keeps emails private, need explicit fetch)
    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const emails = await emailsRes.json();
      const primaryEmail = Array.isArray(emails) ? emails.find(e => e.primary && e.verified) : null;
      email = primaryEmail ? primaryEmail.email : `${githubUser.login}@github.com`; // Fallback
    }

    // Find or Create User
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: githubUser.login,
        email: email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        full_name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio
      });
      await user.save();
    }

    // Generate Token & Redirect
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.redirect(`${clientUrl}/login?token=${token}`);
    });
  } catch (err) {
    console.error('GitHub Login Error:', err);
    res.redirect(`${clientUrl}/login?error=GitHubLoginFailed`);
  }
});

module.exports = router;