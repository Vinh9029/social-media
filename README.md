# BlogSocial - Mạng Xã Hội Kết Nối

BlogSocial là một nền tảng mạng xã hội hiện đại, cho phép người dùng kết nối, chia sẻ bài viết, hình ảnh và tương tác với nhau thông qua like, comment và tin nhắn.

## 🚀 Tính Năng Chính

- **News Feed**: Xem bài viết từ cộng đồng, cập nhật mới nhất.
- **Tương Tác**: Thả cảm xúc (Like, Love, Haha...), bình luận đa cấp và chia sẻ bài viết.
- **Kết Nối**: Theo dõi (Follow) người dùng khác để cập nhật hoạt động của họ.
- **Nhắn Tin**: Trò chuyện riêng tư với bạn bè.
- **Hồ Sơ Cá Nhân**: Tùy chỉnh ảnh đại diện, ảnh bìa và thông tin cá nhân.
- **Tìm Kiếm**: Tìm kiếm người dùng và bài viết thông minh.
- **Thông Báo**: Nhận thông báo khi có tương tác mới.
- **Giao Diện**: Hỗ trợ Dark Mode / Light Mode mượt mà.

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React** (Vite)
- **TypeScript**
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **React Router DOM** (Navigation)

### Backend
- **Node.js** & **Express**
- **MongoDB** (Database)
- **Cloudinary** (Lưu trữ hình ảnh)
- **JWT** (Authentication)

## 📦 Cài Đặt & Chạy Dự Án

### Yêu cầu
- Node.js (v14 trở lên)
- MongoDB (Local hoặc Atlas)
- Tài khoản Cloudinary (để upload ảnh)

### 1. Cấu hình Backend
Di chuyển vào thư mục backend:
```bash
cd backend
npm install
```
Tạo file `.env` trong thư mục `backend` và điền thông tin:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Chạy server:
```bash
npm run dev
```

### 2. Cấu hình Frontend
Mở terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend
npm install
npm run dev
```