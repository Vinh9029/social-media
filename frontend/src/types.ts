export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: 'user' | 'admin';
  bio?: string;
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
  liked?: boolean;
  title?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  postId: string;
  postTitle?: string; // Dành cho trang Admin
}