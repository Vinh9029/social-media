import React, { useState, useEffect, useRef } from 'react';
import { Image, Send, X, Loader2, LogIn, Plus, PlusCircle, Video } from 'lucide-react';
import PostCard from './PostCard';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import PostDetail from '../pages/PostDetail';

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  media: string;
  type: 'image' | 'video';
}

interface StoryDetailViewerProps {
  stories: Story[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const StoryDetailViewer: React.FC<StoryDetailViewerProps> = ({ stories, activeIndex, onClose, onNext, onPrev }) => {
  const currentStory = stories[activeIndex];
  const [progress, setProgress] = useState(0);
  const [storyDuration, setStoryDuration] = useState(5000); 
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setProgress(0);
    if (currentStory && currentStory.type === 'image') {
      setStoryDuration(5000);
    }
  }, [activeIndex, currentStory]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const step = 50; 
    interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onNext();
          return 100;
        }
        return prev + (step / storyDuration) * 100;
      });
    }, step);

    return () => clearInterval(interval);
  }, [activeIndex, storyDuration, onNext]);

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setStoryDuration((videoRef.current.duration + 2) * 1000);
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
        {stories.map((s, idx) => (
          <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-75"
              style={{ 
                width: idx === activeIndex ? `${progress}%` : idx < activeIndex ? '100%' : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20 text-white">
        <div className="flex items-center gap-2">
          <img src={currentStory.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStory.user.name)}&background=random`} className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-lg" alt="" />
          <span className="font-bold text-sm tracking-wide">{currentStory.user.name}</span>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
          <X size={20} />
        </button>
      </div>

      <div className="w-full max-w-lg h-full flex items-center justify-center p-4">
        {currentStory.type === 'video' ? (
          <video 
            ref={videoRef}
            src={currentStory.media} 
            autoPlay 
            playsInline
            onLoadedMetadata={handleVideoMetadata}
            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" 
          />
        ) : (
          <img 
            src={currentStory.media} 
            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" 
            alt="story"
          />
        )}
      </div>

      <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onPrev(); }} />
      <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onNext(); }} />
    </div>
  );
};

const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<Story[]>([
    { id: 's1', user: { name: 'Anh Vinh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }, media: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300', type: 'image' },
    { id: 's2', user: { name: 'Thảo Vy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }, media: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300', type: 'image' },
    { id: 's3', user: { name: 'Nam Phong', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }, media: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300', type: 'image' },
  ]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState<string | null>(null);
  const [storyFileType, setStoryFileType] = useState<'image' | 'video' | null>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedDetailPostId, setSelectedDetailPostId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`);
        if (res.ok) {
          const data = await res.json();
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
            timestamp: p.timestamp || p.createdAt || new Date().toISOString()
          }));
          setPosts(formattedData);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stories`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setStories(data);
          }
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchPosts();
    fetchStories();
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
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadRes = await fetch(`${API_URL}/api/upload/post`, {
          method: 'POST',
          headers: { 'x-auth-token': token || '' },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Lỗi upload ảnh');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const postRes = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ 
          content, 
          image_url: imageUrl,
          title: ''
        })
      });

      if (!postRes.ok) throw new Error('Lỗi đăng bài');
      const newPost = await postRes.json();
      const formattedNewPost = {
        ...newPost,
        id: newPost._id || newPost.id,
        image: newPost.image || newPost.image_url,
        author: (newPost.author && typeof newPost.author === 'object') 
          ? { ...newPost.author, id: newPost.author._id || newPost.author.id, name: newPost.author.name || newPost.author.full_name || user?.name, avatar: newPost.author.avatar || newPost.author.avatar_url || user?.avatar }
          : { id: user.id, name: user.name, username: user.username, avatar: user.avatar },
        timestamp: newPost.timestamp || newPost.createdAt || new Date().toISOString(),
        likes: 0, comments: 0, shares: 0
      };
      setPosts([formattedNewPost, ...posts]);
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

  const handleStoryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoryFile(file);
      setStoryPreviewUrl(URL.createObjectURL(file));
      if (file.type.startsWith('video/')) {
        setStoryFileType('video');
      } else {
        setStoryFileType('image');
      }
    }
  };

  const handleCreateStory = async () => {
    if (!user) return handleAuthRequired();
    if (!storyFile) return;

    setIsUploadingStory(true);
    try {
      let mediaUrl = storyPreviewUrl || '';
      const token = localStorage.getItem('token');

      // Tải tệp lên backend
      const formData = new FormData();
      formData.append('image', storyFile);
      const uploadRes = await fetch(`${API_URL}/api/upload/post`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' },
        body: formData
      });
      if (!uploadRes.ok) throw new Error('Lỗi upload tệp');
      const uploadData = await uploadRes.json();
      mediaUrl = uploadData.url;

      // Lưu câu chuyện vào database
      const storyRes = await fetch(`${API_URL}/api/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify({
          media: mediaUrl,
          type: storyFileType || 'image'
        })
      });

      if (!storyRes.ok) throw new Error('Lỗi lưu Story vào database');
      const savedStory = await storyRes.json();

      setStories([savedStory, ...stories]);
      setStoryFile(null);
      setStoryPreviewUrl(null);
      setStoryFileType(null);
      setShowStoryModal(false);
      showToast('Tạo tin nổi bật thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể đăng tin', 'error');
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex > 0) {
        setActiveStoryIndex(activeStoryIndex - 1);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-6 px-4">
      <div className="mb-6 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-400 mb-3 uppercase tracking-wider">Tin nổi bật & Reels</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none custom-scrollbar">
          {user && (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowStoryModal(true)}
              className="w-28 h-40 flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden border border-white/5 relative cursor-pointer flex flex-col justify-end"
            >
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100"} 
                className="absolute inset-0 w-full h-2/3 object-cover opacity-60" 
                alt="my avatar" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div className="h-1/3 bg-slate-800 flex flex-col items-center justify-center relative pb-2 z-10">
                <div className="absolute -top-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                  <Plus size={16} className="text-white" />
                </div>
                <span className="text-[11px] font-bold text-white mt-3">Tạo tin</span>
              </div>
            </motion.div>
          )}

          {stories.map((story, index) => (
            <motion.div 
              key={story.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveStoryIndex(index)}
              className="w-28 h-40 flex-shrink-0 rounded-2xl overflow-hidden relative border border-white/5 cursor-pointer shadow-lg"
            >
              {story.type === 'video' ? (
                <video src={story.media} className="absolute inset-0 w-full h-full object-cover pointer-events-none" muted playsInline />
              ) : (
                <img src={story.media} className="absolute inset-0 w-full h-full object-cover" alt="story media" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-blue-500 overflow-hidden shadow-md">
                <img src={story.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user.name)}&background=random`} alt="user" className="w-full h-full object-cover" />
              </div>

              {story.type === 'video' && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-[10px] text-white">
                  <Video size={10} />
                </div>
              )}

              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">{story.user.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {user ? (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-4 mb-6 transition-all duration-300">
          <div className="flex gap-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60"}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-lg focus:outline-none resize-none min-h-[60px]"
                rows={2}
              />
              {previewUrl && (
                <div className="relative mt-2 mb-4 rounded-xl overflow-hidden group">
                  <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-cover rounded-xl border border-slate-150 dark:border-slate-700" />
                  <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                <button 
                  onClick={() => user ? fileInputRef.current?.click() : handleAuthRequired()}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold active:scale-95"
                >
                  <Image size={18} />
                  <span>Ảnh/Video</span>
                </button>
                <button 
                  onClick={handlePostSubmit}
                  disabled={(!content.trim() && !selectedImage) || isPosting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-2 rounded-xl font-semibold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>{isPosting ? 'Đang đăng...' : 'Đăng'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 mb-6 transition-all duration-300 text-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chia sẻ câu chuyện của bạn</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Đăng nhập để viết bài, chia sẻ ảnh và kết nối với cộng đồng.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-95 transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost} 
              onPostClick={(id) => setSelectedDetailPostId(id)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">Chưa có bài viết nào.</div>
        )}
      </div>

      <AnimatePresence>
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md border border-white/5 text-slate-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Tạo tin nổi bật / Reels</h3>
                <button onClick={() => setShowStoryModal(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Chọn tệp hình ảnh hoặc video</label>
                <input 
                  type="file" 
                  ref={storyFileInputRef}
                  onChange={handleStoryFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button 
                  onClick={() => storyFileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-700/30 transition-all text-gray-400 group"
                >
                  <PlusCircle size={28} className="group-hover:text-blue-500 mb-2" />
                  <span className="text-xs group-hover:text-blue-500">Tải lên hình ảnh hoặc video</span>
                </button>
              </div>

              {storyPreviewUrl && (
                <div className="mb-4 rounded-xl overflow-hidden h-48 border border-white/5">
                  {storyFileType === 'video' ? (
                    <video src={storyPreviewUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={storyPreviewUrl} className="w-full h-full object-cover" alt="Story Preview" />
                  )}
                </div>
              )}

              <button 
                onClick={handleCreateStory}
                disabled={!storyFile || isUploadingStory}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploadingStory ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>Đăng Tin/Reel</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeStoryIndex !== null && (
        <StoryDetailViewer 
          stories={stories}
          activeIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
        />
      )}

      <AnimatePresence>
        {selectedDetailPostId && (
          <PostDetail 
            propPostId={selectedDetailPostId} 
            onClose={() => setSelectedDetailPostId(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Feed;