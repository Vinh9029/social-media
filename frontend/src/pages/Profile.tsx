import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PostCard from '../components/PostCard';
import { User, Edit2, Save, X, Users, Heart, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Post } from '../types';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    bio: '',
    avatar: '',
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'upload' | 'collection'>('upload');
  const [collection, setCollection] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      // Fetch user's posts
      fetch('http://localhost:5000/api/posts')
        .then(res => res.json())
        .then((data: Post[]) => {
          // Filter posts by current user
          const myPosts = data.filter(p => p.author.id === user.id);
          setPosts(myPosts);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const fetchCollection = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/upload/collection', {
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
      const res = await fetch('http://localhost:5000/api/upload/avatar', {
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

  const handleSave = async () => {
    await updateProfile({
      username: editForm.username,
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar,
    });
    setIsEditing(false);
  };

  if (!user) {
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
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="px-6 pb-6">
            <div className="flex items-start justify-between -mt-16 mb-4">
              <div className="flex items-end space-x-4">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-300 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center group-hover:bg-gray-400 dark:group-hover:bg-slate-600 transition-colors">
                      <User className="w-16 h-16 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-2">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label><input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label><textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label><input type="url" value={editForm.avatar} onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-3">@{user.username}</p>
                {user.bio && <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>}

                <div className="flex items-center space-x-6 text-sm">
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Posts</h2>
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center transition-colors"></div>
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