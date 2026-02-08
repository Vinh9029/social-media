import React, { useState, useEffect } from 'react';
import { Image, Send } from 'lucide-react';
import PostCard from './PostCard';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleAuthRequired = () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để sử dụng tính năng này!", "info");
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4">
      {/* Create Post Input */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6 transition-colors">
        <div className="flex gap-4">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60"}
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-700"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Bạn đang nghĩ gì?"
              className="w-full bg-gray-50 dark:bg-slate-900 dark:text-white dark:placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <div className="flex justify-between items-center mt-3">
              <button 
                onClick={handleAuthRequired}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Image size={18} />
                <span>Ảnh/Video</span>
              </button>
              <button 
                onClick={handleAuthRequired}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95"
              >
                <span>Đăng</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">Chưa có bài viết nào.</div>
        )}
      </div>
    </div>
  );
};

export default Feed;