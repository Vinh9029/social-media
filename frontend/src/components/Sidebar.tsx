import React, { useState, useEffect } from 'react';
import { Home, Hash, Bell, Mail, Bookmark, User, Settings, LogOut, LogIn, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/api/messages/unread-count`, {
            headers: { 'x-auth-token': token || '' }
          });
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching unread count", error);
        }
      };

      fetchUnreadCount();
      // Lắng nghe sự kiện đọc tin nhắn từ trang Messages
      window.addEventListener('messages-read', fetchUnreadCount);
      
      // Có thể thêm interval để polling nếu muốn cập nhật realtime hơn
      const interval = setInterval(fetchUnreadCount, 30000); // 30s check 1 lần
      return () => {
        clearInterval(interval);
        window.removeEventListener('messages-read', fetchUnreadCount);
      };
    }
  }, [user]);

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: Search, label: 'Tìm kiếm', path: '/search' },
    { icon: Hash, label: 'Khám phá', path: '/explore' },
    { icon: Bell, label: 'Thông báo', path: '/notifications' },
    { icon: Mail, label: 'Tin nhắn', path: '/messages' },
    { icon: Bookmark, label: 'Đã lưu', path: '/saved' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Thêm delay nhỏ để tạo hiệu ứng mượt mà
    await new Promise(resolve => setTimeout(resolve, 800));
    await signOut();
    navigate('/login');
    setIsLoggingOut(false);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 px-4 py-6 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-all duration-300">
      <div 
        className="flex items-center gap-3 px-4 mb-8 cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200"
        onClick={() => navigate('/')}
      >
        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <span className="text-white font-extrabold text-xl">D</span>
        </div>
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">DX Social</h1>
      </div>

      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
          <button
            key={item.label}
            onClick={() => {
              const protectedPaths = ['/notifications', '/messages', '/saved', '/profile', '/settings'];
              if (!user && protectedPaths.includes(item.path)) {
                navigate('/not-found');
              } else {
                navigate(item.path);
              }
            }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ease-out group active:scale-[0.98] ${
              isActive
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm shadow-blue-500/5 border-l-4 border-blue-600 dark:border-blue-500 pl-3'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 pl-4 border-l-4 border-transparent'
            }`}
          >
            <div className="relative">
              <item.icon size={20} className={`${isActive ? "stroke-[2.5px] scale-110 text-blue-500" : "stroke-2 group-hover:scale-110"} transition-transform duration-300`} />
              {item.path === '/messages' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[15px]">{item.label}</span>
          </button>
        )})}
      </nav>

      {user ? (
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-xl transition-all duration-300 mt-auto font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
        >
          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut size={20} />
          )}
          <span className="text-[15px]">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </button>
      ) : (
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all duration-300 mt-auto font-semibold active:scale-95 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
        >
          <LogIn size={20} />
          <span className="text-[15px]">Đăng nhập</span>
        </button>
      )}
    </aside>
  );
};

export default Sidebar;