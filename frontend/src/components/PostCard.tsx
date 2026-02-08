import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit2, Trash2, X, Check, Bookmark, Share2 } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { API_URL } from '../config';
import { formatDistanceToNow } from '../utils/dateUtils';
import ReactionBar from './ReactionBar';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState(initialPost);
  
  // Edit & Delete States
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Saved State
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user && user.saved_posts?.includes(post.id)) {
      setIsSaved(true);
    }
  }, [user, post.id]);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReaction = async (type: string) => {
    if (!user) { showToast("Vui lòng đăng nhập", "info"); return; }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/posts/${post.id}/reaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ type })
      });
      
      if (res.ok) {
        const updatedReactions = await res.json();
        setPost(prev => ({ ...prev, reactions: updatedReactions, likes: updatedReactions.length }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(prev => ({ ...prev, content: updatedPost.content, editedAt: updatedPost.editedAt }));
        setIsEditing(false);
        showToast('Đã cập nhật bài viết', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật bài viết', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        showToast('Đã xóa bài viết', 'success');
        if (onDelete) onDelete(post.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi xóa bài viết', 'error');
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { showToast("Vui lòng đăng nhập", "info"); return; }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/save/${post.id}`, {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
        showToast(data.isSaved ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!user) { showToast("Vui lòng đăng nhập", "info"); return; }
    if (!window.confirm('Bạn có muốn chia sẻ bài viết này về trang cá nhân?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/posts/${post.id}/share`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }) // Có thể thêm input để user nhập caption
      });
      if (res.ok) showToast('Đã chia sẻ bài viết', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = () => {
    if (!isEditing) navigate(`/post/${post.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  const myReaction = post.reactions?.find(r => r.user === user?.id)?.type;
  const isOwner = user && (user.id === post.author.id || user._id === post.author.id);
  const isShared = !!post.originalPost;

  return (
    <div 
      onClick={handleNavigate}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-4 hover:shadow-md transition-all duration-200 cursor-pointer relative"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-700"
            onClick={handleProfileClick}
          />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:underline" onClick={handleProfileClick}>{post.author.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{post.author.username} • {formatDistanceToNow(post.timestamp)}
              {post.editedAt && <span className="ml-1 italic text-gray-400">• Đã chỉnh sửa</span>}
              {isShared && <span className="ml-1 text-gray-500">• Đã chia sẻ một bài viết</span>}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleToggleSave}
          className={`absolute top-4 right-12 p-2 rounded-full transition-colors ${isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
        >
          <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
        </button>
        
        {isOwner && (
          <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Edit2 size={14} /> Sửa
                </button>
                <button onClick={() => { handleDeletePost(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div onClick={e => e.stopPropagation()} className="mb-3">
          <textarea 
            value={editContent} 
            onChange={e => setEditContent(e.target.value)} 
            className="w-full p-3 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50/30 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"><X size={14}/> Hủy</button>
            <button onClick={handleUpdatePost} className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1"><Check size={14}/> Lưu</button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line leading-relaxed text-[15px]">
          {post.content}
        </p>
      )}

      {/* Shared Post Content */}
      {isShared && post.originalPost && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-3 mb-3 bg-gray-50 dark:bg-slate-900/50 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.originalPost?.id}`); }}>
          <div className="flex items-center gap-2 mb-2">
            <img src={post.originalPost.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.originalPost.author.name)}&background=random`} className="w-6 h-6 rounded-full" />
            <span className="font-bold text-sm text-gray-900 dark:text-white">{post.originalPost.author.name}</span>
            <span className="text-xs text-gray-500">@{post.originalPost.author.username}</span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-sm mb-2 line-clamp-3">{post.originalPost.content}</p>
          {post.originalPost.image && (
            <div className="rounded-lg overflow-hidden h-40">
              <img src={post.originalPost.image} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {isShared && !post.originalPost && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-3 bg-gray-100 dark:bg-slate-800 text-gray-500 text-sm italic">Bài viết gốc đã bị xóa hoặc không tồn tại.</div>
      )}

      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <ReactionBar 
        likes={post.likes} 
        comments={post.comments} 
        shares={post.shares}
        userReaction={myReaction}
        onReaction={handleReaction}
        onShare={handleShare}
        onComment={() => navigate(`/post/${post.id}`)}
      />
    </div>
  );
};

export default PostCard;