import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Shield, Users, FileText, MessageSquare, Trash2, User, Activity, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import { User as UserType, Post, Comment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

// Mock Data
const MOCK_USERS: UserType[] = [
  { id: 'u1', name: 'Quốc Vinh Admin', username: 'vinh9029', avatar: '/avatar_chatbot.png', role: 'admin', bio: 'Người sáng lập và quản lý hệ thống.' },
  { id: 'u2', name: 'Minh Thư', username: 'minhthu', avatar: '', role: 'user', bio: 'Thích lập trình và kết bạn.' },
  { id: 'u3', name: 'Anh Tuấn', username: 'anhtuan', avatar: '', role: 'user', bio: 'Developer tại Hà Nội.' },
  { id: 'u4', name: 'Thảo Vy', username: 'thaovy', avatar: '', role: 'user', bio: 'Design is my passion.' },
];

const MOCK_POSTS: Post[] = [
  { id: 'p1', author: MOCK_USERS[1], content: 'Chào mọi người, mạng xã hội này xịn quá! Chúc cộng đồng phát triển mạnh mẽ nha 🎉', likes: 12, comments: 2, shares: 1, timestamp: '2026-07-09T08:00:00Z', title: 'Xin chào cộng đồng' },
  { id: 'p2', author: MOCK_USERS[2], content: 'Có ai biết cách cấu hình Gemini API Key vào Chatbot không? Bản mới mượt mà quá!', likes: 8, comments: 4, shares: 0, timestamp: '2026-07-09T08:15:00Z', title: 'Hỏi về Chatbot' },
];

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', content: 'Cảm ơn bạn đã ủng hộ nhé!', author: MOCK_USERS[0], timestamp: '2026-07-09T08:05:00Z', postId: 'p1', postTitle: 'Xin chào cộng đồng' },
  { id: 'c2', content: 'Chỉ cần click nút Setting ⚙️ ở góc chat rồi điền key là chạy ngay nha bạn.', author: MOCK_USERS[0], timestamp: '2026-07-09T08:20:00Z', postId: 'p2', postTitle: 'Hỏi về Chatbot' },
];

const chartData = [
  { name: 'T2', users: 12, posts: 8 },
  { name: 'T3', users: 19, posts: 15 },
  { name: 'T4', users: 32, posts: 24 },
  { name: 'T5', users: 45, posts: 31 },
  { name: 'T6', users: 58, posts: 42 },
  { name: 'T7', users: 84, posts: 65 },
  { name: 'CN', users: 112, posts: 89 },
];

const colorStyles: Record<string, { active: string; inactiveIcon: string; border: string; glow: string }> = {
  blue: {
    active: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-600',
    inactiveIcon: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-500/10'
  },
  indigo: {
    active: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-indigo-600',
    inactiveIcon: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    glow: 'shadow-indigo-500/10'
  },
  emerald: {
    active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-emerald-600',
    inactiveIcon: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/10'
  },
  rose: {
    active: 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 border-rose-600',
    inactiveIcon: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    glow: 'shadow-rose-500/10'
  }
};

export default function Admin() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'comments'>('overview');
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

  // Custom confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'post' | 'comment' | 'user' } | null>(null);

  // If not admin, display denied notice
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700/60 max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
            <Shield className="w-10 h-10 drop-shadow-md" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Từ chối truy cập</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            Bạn không có quyền quản trị viên để truy cập khu vực Dashboard này. Vui lòng quay về trang chủ.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-95 shadow-md shadow-blue-500/25 active:scale-95 transition-all">
            <ArrowLeft size={16} /> Quay về Trang chủ
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleDeleteClick = (id: string, type: 'post' | 'comment' | 'user') => {
    setDeleteTarget({ id, type });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    if (type === 'post') setPosts(posts.filter(p => p.id !== id));
    else if (type === 'comment') setComments(comments.filter(c => c.id !== id));
    else if (type === 'user') setUsers(users.filter(u => u.id !== id));
    
    setDeleteTarget(null);
    showToast(`Đã xóa ${type === 'post' ? 'bài viết' : type === 'comment' ? 'bình luận' : 'người dùng'} thành công!`, 'success');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Quản lý và theo dõi thông số mạng xã hội</p>
            </div>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={14} /> Quay về mạng xã hội
          </Link>
        </motion.div>

        {/* Quick Stats Grid / Nav */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { id: 'overview', icon: Activity, label: 'Tổng quan', color: 'blue' },
            { id: 'users', icon: Users, label: 'Người dùng', count: users.length, color: 'indigo' },
            { id: 'posts', icon: FileText, label: 'Bài viết', count: posts.length, color: 'emerald' },
            { id: 'comments', icon: MessageSquare, label: 'Bình luận', count: comments.length, color: 'rose' }
          ].map((tab) => {
            const styles = colorStyles[tab.color];
            const isSelected = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between h-36 ${
                  isSelected 
                    ? `${styles.active} border-transparent` 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-white/20 text-white' : styles.inactiveIcon}`}>
                    <tab.icon size={20} />
                  </div>
                  {tab.count !== undefined && (
                    <span className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>Mục quản lý</h3>
                  <span className={`text-[15px] font-extrabold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{tab.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Detail Pane */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden"
          >
            {activeTab === 'overview' && (
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Xu hướng cộng đồng</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Thống kê lượng người dùng mới và bài đăng</p>
                  </div>
                </div>
                <div className="h-[350px] w-full mt-4 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#fff', fontSize: 13 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area name="Người dùng mới" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area name="Bài đăng mới" type="monotone" dataKey="posts" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPosts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4 font-extrabold">Thành viên</th>
                      <th className="p-4 font-extrabold">Tiểu sử</th>
                      <th className="p-4 font-extrabold">Quyền hạn</th>
                      <th className="p-4 font-extrabold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <motion.tr variants={itemVariants} key={u.id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`}
                              alt={u.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-tight">{u.name}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">{u.bio || 'Chưa cập nhật tiểu sử'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteClick(u.id, 'user')} 
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                            title="Xóa người dùng"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'posts' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 grid gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {posts.map((post) => (
                  <motion.div 
                    variants={itemVariants} 
                    key={post.id} 
                    className="flex items-start justify-between p-5 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all bg-slate-50/30 dark:bg-slate-900/10"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{post.author.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{post.author.username}</span>
                      </div>
                      {post.title && <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mb-1">{post.title}</h3>}
                      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mb-3 leading-relaxed break-words pr-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                        <span>{post.likes} Lượt thích</span>
                        <span>•</span>
                        <span>{post.comments} Bình luận</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteClick(post.id, 'post')} 
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors ml-4 shrink-0"
                      title="Xóa bài viết"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 grid gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {comments.map((comment) => (
                  <motion.div 
                    variants={itemVariants} 
                    key={comment.id} 
                    className="flex items-start justify-between p-5 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-rose-500/30 dark:hover:border-rose-500/20 transition-all bg-slate-50/30 dark:bg-slate-900/10"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{comment.author.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{comment.author.username}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-xs md:text-sm font-medium mb-2 break-words bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl italic">
                        "{comment.content}"
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Bình luận trên bài viết: <span className="font-bold text-slate-500 dark:text-slate-400">"{comment.postTitle}"</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteClick(comment.id, 'comment')} 
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors ml-4 shrink-0"
                      title="Xóa bình luận"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl w-full max-w-sm border border-slate-150 dark:border-slate-800 text-slate-900 dark:text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Bạn có chắc chắn muốn xóa {deleteTarget.type === 'user' ? 'người dùng' : deleteTarget.type === 'post' ? 'bài viết' : 'bình luận'} này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2.5 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/25 active:scale-95"
                >
                  Đồng ý xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}