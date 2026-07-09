import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit2, Trash2, X, Check, Bookmark, Share2 } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { API_URL } from '../config';
import { formatDistanceToNow } from '../utils/dateUtils';
import ReactionBar from './ReactionBar';
import MediaCarousel from './MediaCarousel';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@tinymce/tinymce-react';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
}

// Helper: strip HTML tags for plain text display
const stripHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, onDelete, onPostClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState(initialPost);
  
  // Edit & Delete States
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const menuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  
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
    const content = editorRef.current ? editorRef.current.getContent() : editContent;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ content })
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
    if (!isEditing) {
      if (onPostClick) {
        onPostClick(post.id);
      } else {
        navigate(`/post/${post.id}`);
      }
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  const myReaction = post.reactions?.find(r => r.user === user?.id)?.type;
  const isOwner = user && (user.id === post.author.id || user._id === post.author.id);
  const isShared = !!post.originalPost;

  // Check if content is HTML (rich text)
  const isHtmlContent = post.content?.startsWith('<') && post.content?.includes('>');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      onClick={handleNavigate}
      className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-5 mb-5 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.img
            whileHover={{ scale: 1.1 }}
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-700 shadow-sm cursor-pointer"
            onClick={handleProfileClick}
          />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] hover:text-blue-600 transition-colors cursor-pointer" onClick={handleProfileClick}>{post.author.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              @{post.author.username} • {formatDistanceToNow(post.timestamp)}
              {post.editedAt && <span className="ml-1 italic opacity-70">• Đã chỉnh sửa</span>}
              {isShared && <span className="ml-1 opacity-70">• Đã chia sẻ</span>}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleSave}
          className={`absolute top-5 right-14 p-2 rounded-full transition-colors ${isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
        >
          <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
        </motion.button>
        
        {isOwner && (
          <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <MoreHorizontal size={20} />
            </motion.button>
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-10"
                >
                  <button onClick={() => { setEditContent(post.content); setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                    <Edit2 size={16} /> Chỉnh sửa
                  </button>
                  <button onClick={() => { handleDeletePost(); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                    <Trash2 size={16} /> Xóa bài
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isEditing ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          onClick={e => e.stopPropagation()} 
          className="mb-4"
        >
          {/* TinyMCE Rich Text Editor */}
          <div className="rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-900/50 shadow-sm">
            <Editor
              apiKey={import.meta.env.TINYMCE_API_KEY || import.meta.env.VITE_TINYMCE_API_KEY}
              onInit={(evt, editor) => { editorRef.current = editor; }}
              initialValue={post.content}
              init={{
                height: 200,
                menubar: false,
                branding: false,
                statusbar: false,
                plugins: ['lists', 'link', 'emoticons', 'wordcount'],
                toolbar: 'bold italic underline | bullist numlist | link emoticons | removeformat',
                content_style: 'body { font-family: "Inter", Helvetica, Arial, sans-serif; font-size:16px; background-color: transparent !important; color: inherit; }',
                placeholder: 'Viết nội dung bài đăng của bạn...',
                skin: 'oxide',
                content_css: 'default',
              }}
            />
          </div>
          <div className="flex justify-end gap-3 mt-3">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1 transition-colors"><X size={16}/> Hủy</button>
            <button onClick={handleUpdatePost} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all"><Check size={16}/> Lưu thay đổi</button>
          </div>
        </motion.div>
      ) : (
        isHtmlContent ? (
          <div 
            className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed text-[16px] prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-line leading-relaxed text-[16px]">
            {post.content}
          </p>
        )
      )}

      {/* Shared Post Content */}
      {isShared && post.originalPost && (
        <motion.div 
          whileHover={{ scale: 0.99 }}
          className="border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mb-4 bg-gray-50 dark:bg-slate-900/50 cursor-pointer overflow-hidden" 
          onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.originalPost?.id}`); }}
        >
          <div className="flex items-center gap-2 mb-3">
            <img src={post.originalPost.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.originalPost.author.name)}&background=random`} className="w-6 h-6 rounded-full" />
            <span className="font-bold text-sm text-gray-900 dark:text-white hover:underline">{post.originalPost.author.name}</span>
            <span className="text-xs text-gray-500 font-medium">@{post.originalPost.author.username}</span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-[15px] mb-3 line-clamp-3">{post.originalPost.content}</p>
          {post.originalPost.image && (
            <div className="rounded-xl overflow-hidden h-48 -mx-4 -mb-4">
              <img src={post.originalPost.image} className="w-full h-full object-cover" />
            </div>
          )}
        </motion.div>
      )}

      {isShared && !post.originalPost && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mb-4 bg-gray-100 dark:bg-slate-800/80 text-gray-500 text-sm font-medium italic">Bài viết gốc đã bị xóa hoặc không còn tồn tại.</div>
      )}

      <MediaCarousel mediaUrls={post.images?.length ? post.images : (post.image ? [post.image] : [])} />

      <div className="pt-2 border-t border-gray-100 dark:border-slate-700/50">
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
    </motion.div>
  );
};

export default PostCard;