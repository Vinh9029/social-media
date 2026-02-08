const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Cấu hình Storage cho Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tạo thư mục riêng cho từng user: uploads/users/{userId}
    const userDir = path.join(__dirname, '../../frontend/public/uploads/users', req.user.id);
    
    if (!fs.existsSync(userDir)){
        fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Tên file: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh!'));
  }
});

// Upload Avatar Route
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
    }

    // Tạo đường dẫn URL tương đối để frontend truy cập từ thư mục public
    // Ví dụ: /uploads/users/userId/filename.jpg
    const avatarUrl = `/uploads/users/${req.user.id}/${req.file.filename}`;

    // Cập nhật avatar cho user trong DB
    await User.findByIdAndUpdate(req.user.id, { avatar_url: avatarUrl });

    res.json({ avatar: avatarUrl, message: 'Upload thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi upload' });
  }
});

// Upload Cover Image Route
router.post('/cover', auth, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
    }

    // Tạo đường dẫn URL
    const coverUrl = `/uploads/users/${req.user.id}/${req.file.filename}`;

    // Cập nhật cover_url cho user trong DB
    await User.findByIdAndUpdate(req.user.id, { cover_url: coverUrl });

    res.json({ cover: coverUrl, message: 'Upload thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi upload' });
  }
});

// Upload Post Image Route
router.post('/post', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
    }

    // Tạo đường dẫn URL
    const imageUrl = `/uploads/users/${req.user.id}/${req.file.filename}`;

    // Trả về URL để frontend dùng tạo bài viết
    res.json({ url: imageUrl, message: 'Upload thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi upload' });
  }
});

// Lấy danh sách ảnh trong bộ sưu tập của User
router.get('/collection', auth, async (req, res) => {
  try {
    const userDir = path.join(__dirname, '../../frontend/public/uploads/users', req.user.id);
    if (!fs.existsSync(userDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(userDir);
    const urls = files.map(file => `/uploads/users/${req.user.id}/${file}`);
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy bộ sưu tập' });
  }
});

module.exports = router;