export interface User {
  id: string;
  _id?: string;
  name: string;
  username: string;
  avatar: string;
  role?: 'user' | 'admin';
  bio?: string;
  email?: string;
  cover?: string;
  github?: string;
  facebook?: string;
  linkedin?: string;
  saved_posts?: string[]; // Danh sách ID bài viết đã lưu
  followers?: string[];
  following?: string[];
  blocked_users?: string[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  reactions?: { user: string; type: string }[];
  title?: string;
  editedAt?: string;
  originalPost?: Post; // Bài viết gốc nếu là share
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  postId: string;
  postTitle?: string;
  parentId?: string | null;
  likes?: string[];
  replies?: Comment[];
}

export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  createdAt: string;
  read: boolean; // Trạng thái đã đọc
}

export interface Conversation {
  partnerId: string;
  username: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  read: boolean;
  isSender: boolean;
}