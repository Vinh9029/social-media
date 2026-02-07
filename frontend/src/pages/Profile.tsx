import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { User, Edit2, Save, X, Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';

const MOCK_MY_POSTS: Post[] = [
  {
    id: '1',
    author: { id: 'u1', name: 'Admin User', username: 'admin', avatar: '', role: 'admin' },
    content: 'My first post on this platform!',
    likes: 5, comments: 1, shares: 0, timestamp: '1 hour ago', liked: false
  }
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    bio: '',
    avatar: '',
  });
  const [posts] = useState<Post[]>(MOCK_MY_POSTS);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateProfile({
      username: editForm.username,
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar,
    });
    setIsEditing(false);
  };

  if (!user) return <div className="p-8 text-center">Please login to view profile</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="px-6 pb-6">
            <div className="flex items-start justify-between -mt-16 mb-4">
              <div className="flex items-end space-x-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white object-cover" />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                )}
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
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label><textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label><input type="url" value={editForm.avatar} onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 mb-3">@{user.username}</p>
                {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-blue-600 font-semibold">{posts.length}</span></div><span className="text-gray-600">Posts</span></div>
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div><span className="text-gray-600">120 Followers</span></div>
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div><span className="text-gray-600">50 Following</span></div>
                  <div className="flex items-center space-x-2"><div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"><Heart className="w-4 h-4 text-red-600" /></div><span className="text-gray-600">300 Likes</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Posts</h2>
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}