import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, MessageSquare, Trash2, User, Activity, TrendingUp } from 'lucide-react';
import { User as UserType, Post, Comment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const MOCK_USERS: UserType[] = [
  { id: 'u1', name: 'Admin User', username: 'admin', avatar: '', role: 'admin', bio: '' },
  { id: 'u2', name: 'John Doe', username: 'johndoe', avatar: '', role: 'user', bio: '' },
  { id: 'u3', name: 'Jane Smith', username: 'janesmith', avatar: '', role: 'user', bio: '' },
  { id: 'u4', name: 'Mike Ross', username: 'mikeross', avatar: '', role: 'user', bio: '' },
];

const MOCK_POSTS: Post[] = [
  { id: 'p1', author: MOCK_USERS[1], content: 'Hello World', likes: 10, comments: 2, shares: 1, timestamp: '2023-01-01', title: 'First Post' },
  { id: 'p2', author: MOCK_USERS[2], content: 'React is awesome', likes: 20, comments: 5, shares: 3, timestamp: '2023-01-02', title: 'React Tips' },
];

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', content: 'Great post!', author: MOCK_USERS[2], timestamp: '2023-01-01', postId: 'p1', postTitle: 'First Post' },
  { id: 'c2', content: 'Thanks!', author: MOCK_USERS[1], timestamp: '2023-01-01', postId: 'p1', postTitle: 'First Post' },
];

const chartData = [
  { name: 'Mon', users: 120, posts: 30 },
  { name: 'Tue', users: 150, posts: 45 },
  { name: 'Wed', users: 180, posts: 35 },
  { name: 'Thu', users: 220, posts: 60 },
  { name: 'Fri', users: 250, posts: 80 },
  { name: 'Sat', users: 290, posts: 95 },
  { name: 'Sun', users: 310, posts: 110 },
];

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'comments'>('overview');
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

  // Nếu không phải admin, hiển thị thông báo
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700"
        >
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6 drop-shadow-md" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">Bạn không có quyền truy cập trang quản trị.</p>
        </motion.div>
      </div>
    );
  }

  const handleDelete = (id: string, type: 'post' | 'comment' | 'user') => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${type} này?`)) return;
    if (type === 'post') setPosts(posts.filter(p => p.id !== id));
    else if (type === 'comment') setComments(comments.filter(c => c.id !== id));
    else if (type === 'user') setUsers(users.filter(u => u.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Quản lý toàn bộ hệ thống</p>
            </div>
          </div>
        </motion.div>

        {/* Top Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { id: 'overview', icon: Activity, label: 'Tổng quan', color: 'blue' },
            { id: 'users', icon: Users, label: 'Người dùng', count: users.length, color: 'indigo' },
            { id: 'posts', icon: FileText, label: 'Bài viết', count: posts.length, color: 'emerald' },
            { id: 'comments', icon: MessageSquare, label: 'Bình luận', count: comments.length, color: 'rose' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                activeTab === tab.id 
                  ? `bg-${tab.color}-600 border-${tab.color}-600 shadow-lg shadow-${tab.color}-600/30 text-white` 
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${activeTab === tab.id ? 'bg-white/20' : `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-600 dark:text-${tab.color}-400`}`}>
                  <tab.icon size={24} />
                </div>
                {tab.count !== undefined && (
                  <span className={`text-2xl font-bold ${activeTab === tab.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </div>
              <h3 className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{tab.label}</h3>
            </motion.button>
          ))}
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {activeTab === 'overview' && (
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tăng trưởng người dùng 7 ngày qua</h3>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="posts" stroke="#10b981" fillOpacity={1} fill="url(#colorPosts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-slate-700">
                      <th className="p-4 font-medium">Người dùng</th>
                      <th className="p-4 font-medium">Vai trò</th>
                      <th className="p-4 font-medium text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <motion.tr variants={itemVariants} key={u.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(u.id, 'user')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'posts' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 grid gap-4">
                {posts.map((post) => (
                  <motion.div variants={itemVariants} key={post.id} className="flex items-start justify-between p-5 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <div className="flex-1">
                      {post.title && <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{post.title}</h3>}
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><User size={14}/> @{post.author.username}</span>
                        <span>{post.likes} Likes</span>
                        <span>{post.comments} Comments</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(post.id, 'post')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-4">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 grid gap-4">
                {comments.map((comment) => (
                  <motion.div variants={itemVariants} key={comment.id} className="flex items-start justify-between p-5 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200 mb-2">"{comment.content}"</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bởi <span className="font-medium text-gray-700 dark:text-gray-300">@{comment.author.username}</span> trên bài viết "{comment.postTitle}"
                      </p>
                    </div>
                    <button onClick={() => handleDelete(comment.id, 'comment')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-4">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}