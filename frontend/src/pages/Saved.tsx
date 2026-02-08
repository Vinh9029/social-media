import React, { useEffect, useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import PostCard from '../components/PostCard';
import { Post } from '../types';

const Saved = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users/saved`, {
          headers: { 'x-auth-token': token || '' }
        });
        if (res.ok) {
          const data = await res.json();
          // Map data to Post type
          const formattedData = data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            image: p.image || p.image_url,
            author: p.author ? { 
              ...p.author, 
              id: p.author._id || p.author.id,
              name: p.author.name || p.author.full_name || 'Unknown User',
              avatar: p.author.avatar || p.author.avatar_url
            } : { id: 'unknown', name: 'Unknown User', username: 'unknown', avatar: '' },
            timestamp: p.timestamp || p.createdAt
          }));
          setPosts(formattedData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Bookmark className="text-blue-600" /> Đã lưu</h1>
      
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 text-center transition-colors">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4"><Bookmark className="w-8 h-8 text-blue-500" /></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chưa có bài viết nào</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Lưu lại các bài viết thú vị để xem lại sau.</p>
        </div>
      )}
    </div>
  );
};

export default Saved;