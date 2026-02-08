import React, { useState } from 'react';
import { Home, Hash, Bell, Mail, Bookmark, User, Settings, LogOut, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 px-4 py-6 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div 
        className="flex items-center gap-2 px-4 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">BlogSocial</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <item.icon size={22} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
            <span>{item.label}</span>
          </button>
        )})}
      </nav>

      {user ? (
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 mt-auto font-medium hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut size={22} />
          )}
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </button>
      ) : (
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 mt-auto font-medium hover:shadow-sm active:scale-95"
        >
          <LogIn size={22} />
          <span>Đăng nhập</span>
        </button>
      )}
    </aside>
  );
};

export default Sidebar;