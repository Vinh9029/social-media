import React, { useState, useEffect } from 'react';
import { Image, Send } from 'lucide-react';
import PostCard from './PostCard';
import { Post } from '../types';

const Feed = () => {
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