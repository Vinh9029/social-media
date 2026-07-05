const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const User = require('../models/User');

const fs = require('fs');
const path = require('path');

// Cấu hình thư mục upload cục bộ trong frontend/public/uploads
const uploadDir = path.join(__dirname, '../../frontend/public/uploads');

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

let storage;

if (isCloudinaryConfigured) {
  // Cấu hình Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Cấu hình Storage Cloudinary
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: 'social-app',
        resource_type: 'auto',
      };
    }
  });
} else {
  console.log('>>> WARNING: Cloudinary credentials missing. Falling back to local disk storage in frontend/public/uploads.');
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({ storage: storage });

// Helper to get public URL of uploaded file
const getFileUrl = (file) => {
  return file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
};

// Upload Avatar Route
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
    }

    const avatarUrl = getFileUrl(req.file);

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

    const coverUrl = getFileUrl(req.file);

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

    const imageUrl = getFileUrl(req.file);

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
    // Cloudinary không hỗ trợ list file đơn giản qua API public này
    // Trả về mảng rỗng hoặc cần implement Admin API nếu muốn
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy bộ sưu tập' });
  }
});

module.exports = router;