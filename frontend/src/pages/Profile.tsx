import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PostCard from '../components/PostCard';
import { User, Edit2, Save, X, Users, Heart, Camera, Upload, Image as ImageIcon, Github, Facebook, Linkedin, UserPlus, MessageSquare } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Post, User as UserType } from '../types';
import { API_URL } from '../config';

export default function Profile() {
  const { user: currentUser, updateProfile } = useAuth();
  const { userId } = useParams(); // Lấy ID từ URL
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    bio: '',
    avatar: '',
    github: '',
    facebook: '',
    linkedin: '',
  });
  
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'upload' | 'collection'>('upload');
  const [collection, setCollection] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  // Xác định xem đây có phải profile của chính mình không
  // Nếu không có userId trên URL HOẶC userId trùng với ID của người đang đăng nhập
  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (isOwnProfile) {
        // Xem profile chính mình
        setProfileUser(currentUser);
      } else if (userId) {
        // Xem profile người khác
        try {
          const res = await fetch(`${API_URL}/api/auth/profile/${userId}`);
          if (res.ok) {
            const data = await res.json();
            // Đảm bảo có id để dùng cho các chức năng follow/message
            setProfileUser({ ...data, id: data._id || data.id });
            // Check if following
            if (currentUser && data.followers && (data.followers.includes(currentUser.id) || data.followers.includes(currentUser._id))) {
              setIsFollowing(true);
            }
          } else {
            showToast('Không tìm thấy người dùng', 'error');
            navigate('/');
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchProfileData();
  }, [userId, currentUser, isOwnProfile, navigate]);

  useEffect(() => {
    if (profileUser) {
      setEditForm({
        username: profileUser.username || '',
        name: profileUser.name || '',
        bio: profileUser.bio || '',
        avatar: profileUser.avatar || '',
        github: profileUser.github || '',
        facebook: profileUser.facebook || '',
        linkedin: profileUser.linkedin || '',
      });
      // Fetch user's posts
      fetch(`${API_URL}/api/posts`)
        .then(res => res.json())
        .then((data: any[]) => {
          // Map _id to id
          const formattedData = data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            image: p.image || p.image_url,
            author: p.author ? { 
              ...p.author, 
              id: p.author._id || p.author.id,
              name: p.author.name || p.author.full_name || 'Unknown User',
              avatar: p.author.avatar || p.author.avatar_url
            } : { id: 'unknown', name: 'Unknown User', username: 'unknown', avatar: '' }
          }));
          // Filter posts by profile user
          const myPosts = formattedData.filter((p: Post) => p.author.id === profileUser.id);
          setPosts(myPosts);
        })
        .catch(err => console.error(err));
    }
  }, [profileUser]);

  const fetchCollection = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/upload/collection`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setCollection(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/upload/avatar`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      await updateProfile({ avatar: data.avatar });
      showToast('Cập nhật ảnh đại diện thành công', 'success');
      setShowAvatarModal(false);
    } catch (error: any) {
      showToast(error.message || 'Lỗi upload ảnh', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromCollection = async (url: string) => {
    await updateProfile({ avatar: url });
    showToast('Đã chọn ảnh đại diện', 'success');
    setShowAvatarModal(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/upload/cover`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await updateProfile({ cover: data.cover });
      showToast('Cập nhật ảnh bìa thành công', 'success');
    } catch (error: any) {
      showToast(error.message || 'Lỗi upload ảnh bìa', 'error');
    }
  };

  const handleSave = async () => {
    await updateProfile({
      username: editForm.username,
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar,
      github: editForm.github,
      facebook: editForm.facebook,
      linkedin: editForm.linkedin,
    });
    setIsEditing(false);
  };

  const handleFollow = async () => {
    if (!profileUser) return;
    if (!currentUser) { showToast('Vui lòng đăng nhập', 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/follow/${profileUser.id}`, {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        showToast(data.msg === 'Followed' ? 'Đã theo dõi' : 'Đã hủy theo dõi', 'success');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMessage = () => {
    navigate('/messages', { state: { startChat: profileUser } });
  };

  if (!currentUser && isOwnProfile) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Bạn cần đăng nhập để xem hồ sơ cá nhân.</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!profileUser) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-900 transition-colors">
      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Đổi ảnh đại diện</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="flex border-b border-gray-100 dark:border-slate-700">
              <button onClick={() => setAvatarTab('upload')} className={`flex-1 py-3 text-sm font-medium transition-colors ${avatarTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>Upload Ảnh</button>
              <button onClick={() => { setAvatarTab('collection'); fetchCollection(); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${avatarTab === 'collection' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>Bộ sưu tập</button>
            </div>

            <div className="p-6">
              {avatarTab === 'upload' ? (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer relative group">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {uploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div> : <Upload className="w-8 h-8 text-blue-500" />}
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">{uploading ? 'Đang tải lên...' : 'Click để chọn ảnh'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF (Max 5MB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {collection.length > 0 ? (
                    collection.map((url, idx) => (
                      <div key={idx} onClick={() => handleSelectFromCollection(url)} className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 relative group">
                        <img src={url} alt="Collection" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>Chưa có ảnh nào trong bộ sưu tập</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700 overflow-hidden mb-8 transition-colors">
          {/* Cover Image Section */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-indigo-600 group">
            {profileUser.cover && (
              <img src={profileUser.cover} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  className="absolute bottom-4 right-4 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Camera size={18} />
                  <span>Đổi ảnh bìa</span>
                </button>
                <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </>
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-4 relative">
              {/* Avatar */}
              <div className={`relative group shrink-0 z-10 ${isOwnProfile ? 'cursor-pointer' : ''}`} onClick={() => isOwnProfile && setShowAvatarModal(true)}>
                {profileUser.avatar ? (
                  <img src={profileUser.avatar} alt={profileUser.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 object-cover group-hover:opacity-90 transition-opacity shadow-md" />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center group-hover:bg-gray-400 dark:group-hover:bg-slate-600 transition-colors shadow-md">
                    <User className="w-16 h-16 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-2">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div className="flex-1 w-full flex justify-center md:justify-end mt-4 md:mt-0 gap-3">
                {/* Actions */}
                <div className="flex gap-3">
                    {!isEditing ? (
                      <>
                        {!isOwnProfile && (
                          <>
                            <button 
                              onClick={handleFollow}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-sm active:scale-95 ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'}`}
                            >
                              <UserPlus size={18} />
                              <span>{isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</span>
                            </button>
                            <button onClick={handleMessage} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition active:scale-95">
                              <MessageSquare size={18} />
                              <span>Nhắn tin</span>
                            </button>
                          </>
                        )}
                        {isOwnProfile && (
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition active:scale-95">
                            <Edit2 size={18} />
                            <span>Sửa hồ sơ</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex space-x-2">
                        <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                          <Save className="w-4 h-4" />
                          <span>Lưu</span>
                        </button>
                        <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                          <X className="w-4 h-4" />
                          <span>Hủy</span>
                        </button>
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* User Info Section */}
            <div className="text-center md:text-left mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-1 justify-center md:justify-between w-full">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.name}</h1>
                
                {/* Social Links */}
                {!isEditing && (
                  <div className="flex gap-3">
                    {profileUser.github && <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={20} strokeWidth={2} /></a>}
                    {profileUser.facebook && <a href={profileUser.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Facebook size={20} strokeWidth={2} /></a>}
                    {profileUser.linkedin && <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"><Linkedin size={20} strokeWidth={2} /></a>}
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 font-medium">@{profileUser.username}</p>


              {/* Bio */}
              {!isEditing && profileUser.bio && <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-2xl mx-auto md:mx-0">{profileUser.bio}</p>}
            </div>

            {isEditing ? (
              <div className="space-y-4 mt-6">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label><input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label><textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label><input type="url" value={editForm.avatar} onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label><input type="url" value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" placeholder="https://github.com/username" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label><input type="url" value={editForm.facebook} onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" placeholder="https://facebook.com/username" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label><input type="url" value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" placeholder="https://linkedin.com/in/username" /></div>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-around md:justify-start md:space-x-12 text-sm">
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"><span className="text-blue-600 dark:text-blue-400 font-semibold">{posts.length}</span></div><span className="text-gray-600 dark:text-gray-400">Posts</span></div>
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"><Users className="w-4 h-4 text-green-600 dark:text-green-400" /></div><span className="text-gray-600 dark:text-gray-400">0 Followers</span></div>
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"><Users className="w-4 h-4 text-green-600 dark:text-green-400" /></div><span className="text-gray-600 dark:text-gray-400">0 Following</span></div>
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"><Heart className="w-4 h-4 text-red-600 dark:text-red-400" /></div><span className="text-gray-600 dark:text-gray-400">0 Likes</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{isOwnProfile ? 'Bài viết của tôi' : `Bài viết của ${profileUser.name}`}</h2>
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center transition-colors"><p className="text-gray-500 dark:text-gray-400">Chưa có bài viết nào.</p></div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
