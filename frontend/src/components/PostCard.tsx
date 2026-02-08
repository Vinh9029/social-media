import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { API_URL } from '../config';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast("Vui lòng đăng nhập để thích bài viết", "info");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const previousPost = { ...post };
    const newLikedState = !post.liked;
    
    setPost(prev => ({
      ...prev,
      liked: newLikedState,
      likes: newLikedState ? prev.likes + 1 : prev.likes - 1
    }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' }
      });
      
      if (res.ok) {
        const likes = await res.json();
        const hasLiked = likes.includes(user.id);
        setPost(prev => ({ ...prev, likes: likes.length, liked: hasLiked }));
      } else {
        setPost(previousPost);
      }
    } catch (err) {
      setPost(previousPost);
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleNavigate = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div 
      onClick={handleNavigate}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-4 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-700"
          />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:underline" onClick={(e) => e.stopPropagation()}>{post.author.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{post.author.username} • {post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line leading-relaxed text-[15px]">
        {post.content}
      </p>

      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-700">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors group ${post.liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
        >
          <div className={`p-2 rounded-full transition-colors ${post.liked ? 'bg-red-50 dark:bg-red-900/20' : 'group-hover:bg-red-50 dark:group-hover:bg-red-900/20'}`}>
            <Heart size={20} className={post.liked ? "fill-current" : ""} />
          </div>
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
            <MessageCircle size={20} />
          </div>
          <span className="text-sm font-medium group-hover:text-blue-500">{post.comments}</span>
        </button>

        <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors group">
          <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
            <Share2 size={20} />
          </div>
          <span className="text-sm font-medium group-hover:text-green-500">{post.shares}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;