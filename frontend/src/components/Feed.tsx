import React from 'react';
import { Image, Send } from 'lucide-react';
import PostCard from './PostCard';
import { Post } from '../types';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: {
      id: 'u1',
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    },
    content: 'Hôm nay trời đẹp quá! Mọi người có kế hoạch gì cho cuối tuần chưa? 🌞',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60',
    likes: 124,
    comments: 12,
    shares: 5,
    timestamp: '2 giờ trước',
    liked: true,
  },
  {
    id: '2',
    author: {
      id: 'u2',
      name: 'Trần Thị B',
      username: 'tranthib',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    },
    content: 'Vừa hoàn thành xong project mới. Cảm giác thật tuyệt vời! 💻🚀\n#coding #frontend #react',
    likes: 89,
    comments: 24,
    shares: 2,
    timestamp: '4 giờ trước',
  },
];

const Feed = () => {
  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4">
      {/* Create Post Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-4">
          <img
            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60"
            alt="Current User"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Bạn đang nghĩ gì?"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
            <div className="flex justify-between items-center mt-3">
              <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                <Image size={18} />
                <span>Ảnh/Video</span>
              </button>
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2">
                <span>Đăng</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {MOCK_POSTS.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;