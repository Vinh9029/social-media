import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, MessageSquare, Trash2, User } from 'lucide-react';
import { User as UserType, Post, Comment } from '../types';

// Mock Data
const MOCK_USERS: UserType[] = [
  { id: 'u1', name: 'Admin User', username: 'admin', avatar: '', role: 'admin', bio: '' },
  { id: 'u2', name: 'John Doe', username: 'johndoe', avatar: '', role: 'user', bio: '' },
  { id: 'u3', name: 'Jane Smith', username: 'janesmith', avatar: '', role: 'user', bio: '' },
];

const MOCK_POSTS: Post[] = [
  { id: 'p1', author: MOCK_USERS[1], content: 'Hello World', likes: 10, comments: 2, shares: 1, timestamp: '2023-01-01', title: 'First Post' },
  { id: 'p2', author: MOCK_USERS[2], content: 'React is awesome', likes: 20, comments: 5, shares: 3, timestamp: '2023-01-02', title: 'React Tips' },
];

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', content: 'Great post!', author: MOCK_USERS[2], timestamp: '2023-01-01', postId: 'p1', postTitle: 'First Post' },
  { id: 'c2', content: 'Thanks!', author: MOCK_USERS[1], timestamp: '2023-01-01', postId: 'p1', postTitle: 'First Post' },
];

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments'>('users');
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

  // Nếu không phải admin, hiển thị thông báo
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleDelete = (id: string, type: 'post' | 'comment') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    if (type === 'post') {
      setPosts(posts.filter(p => p.id !== id));
    } else {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{posts.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Comments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{comments.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button onClick={() => setActiveTab('users')} className={`py-4 border-b-2 font-medium transition ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Users</button>
              <button onClick={() => setActiveTab('posts')} className={`py-4 border-b-2 font-medium transition ${activeTab === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Posts</button>
              <button onClick={() => setActiveTab('comments')} className={`py-4 border-b-2 font-medium transition ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Comments</button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-gray-600" /></div>
                      <div><h3 className="font-semibold text-gray-900">{u.name}</h3><p className="text-sm text-gray-600">@{u.username}</p></div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role || 'user'}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between p-4 border border-gray-200/50 rounded-xl hover:bg-gray-50">
                    <div className="flex-1">
                      {post.title && <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>}
                      <p className="text-gray-700 text-sm line-clamp-2 mb-2">{post.content}</p>
                      <p className="text-xs text-gray-500">by @{post.author.username}</p>
                    </div>
                    <button onClick={() => handleDelete(post.id, 'post')} className="ml-4 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start justify-between p-4 border border-gray-200/50 rounded-xl hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <p className="text-xs text-gray-500">by @{comment.author.username} on "{comment.postTitle}"</p>
                    </div>
                    <button onClick={() => handleDelete(comment.id, 'comment')} className="ml-4 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}