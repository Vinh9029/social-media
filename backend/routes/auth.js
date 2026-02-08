const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Helper: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, full_name } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      full_name,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name || username)}&background=random`
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, name: user.full_name, avatar: user.avatar_url } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, name: user.full_name, avatar: user.avatar_url } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fields = ['name', 'username', 'bio', 'avatar', 'cover', 'github', 'facebook', 'linkedin'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'name') user.full_name = req.body[field];
        else if (field === 'avatar') user.avatar_url = req.body[field];
        else if (field === 'cover') user.cover_url = req.body[field];
        else user[field] = req.body[field];
      }
    });

    await user.save();
    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      name: user.full_name, 
      avatar: user.avatar_url,
      bio: user.bio,
      cover: user.cover_url,
      github: user.github,
      facebook: user.facebook,
      linkedin: user.linkedin
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/change-password
// @desc    Change password
// @access  Private
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
    res.status(500).send('Server Error');
  }
});

// --- OAUTH ---

// Google Login
router.get('/google', (req, res) => {
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=&redirect_uri=&response_type=code&scope=profile email`;
  res.redirect(url);
});

// Google Callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenRes.json();
    
    // Get User Info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    // Logic login/register
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = new User({
        username: userData.email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: userData.email,
        password: hashedPassword,
        full_name: userData.name,
        avatar_url: userData.picture
      });
      await user.save();
    }

    const token = generateToken(user.id);
    res.redirect(`${process.env.CLIENT_URL}?token=`);
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);
  }
});

// GitHub Login
router.get('/github', (req, res) => {
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const url = `https://github.com/login/oauth/authorize?client_id=&redirect_uri=&scope=user:email`;
  res.redirect(url);
});

// GitHub Callback
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
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

    // Get User Info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    // Get Email (if private)
    let email = userData.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const emails = await emailRes.json();
      const primary = emails.find(e => e.primary && e.verified);
      email = primary ? primary.email : null;
    }

    if (!email) throw new Error('No email found from GitHub');

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        username: userData.login,
        email: email,
        password: hashedPassword,
        full_name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        github: userData.html_url,
        bio: userData.bio
      });
      await user.save();
    }

    const token = generateToken(user.id);
    res.redirect(`${process.env.CLIENT_URL}?token=`);
  } catch (err) {
    console.error('GitHub Auth Error:', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=GitHubAuthFailed`);
  }
});

module.exports = router;
