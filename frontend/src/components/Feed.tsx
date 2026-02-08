import React, { useState, useEffect, useRef } from 'react';
import { Image, Send, X, Loader2, LogIn } from 'lucide-react';
import PostCard from './PostCard';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho bài viết mới
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostSubmit = async () => {
    if (!user) return handleAuthRequired();
    if (!content.trim() && !selectedImage) return;

    setIsPosting(true);
    try {
      let imageUrl = '';
      const token = localStorage.getItem('token');

      // 1. Upload ảnh nếu có
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadRes = await fetch('http://localhost:5000/api/upload/post', {
          method: 'POST',
          headers: { 'x-auth-token': token || '' },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Lỗi upload ảnh');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // 2. Tạo bài viết
      const postRes = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ 
          content, 
          image_url: imageUrl,
          title: '' // Backend có thể yêu cầu title, để trống nếu không cần
        })
      });

      if (!postRes.ok) throw new Error('Lỗi đăng bài');
      
      const newPost = await postRes.json();
      setPosts([newPost, ...posts]); // Thêm bài mới lên đầu
      
      // Reset form
      setContent('');
      removeImage();
      showToast('Đăng bài thành công!', 'success');

    } catch (error) {
      console.error(error);
      showToast('Có lỗi xảy ra khi đăng bài', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4">
      {/* Create Post Input */}
      {user ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6 transition-colors">
          <div className="flex gap-3">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60"}
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-700"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg focus:outline-none resize-none min-h-[60px]"
              rows={2}
            />
            
            {previewUrl && (
              <div className="relative mt-2 mb-4 rounded-xl overflow-hidden group">
                <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-cover rounded-xl border border-gray-100 dark:border-slate-700" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-slate-700">
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
              <button 
                onClick={() => user ? fileInputRef.current?.click() : handleAuthRequired()}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Image size={20} />
                <span>Ảnh/Video</span>
              </button>
              <button 
                onClick={handlePostSubmit}
                disabled={(!content.trim() && !selectedImage) || isPosting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>{isPosting ? 'Đang đăng...' : 'Đăng'}</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6 transition-colors text-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chia sẻ câu chuyện của bạn</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Đăng nhập để viết bài, chia sẻ ảnh và kết nối với cộng đồng.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

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