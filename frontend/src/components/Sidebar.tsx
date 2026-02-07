import React from 'react';
import { Home, Hash, Bell, Mail, Bookmark, User, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

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
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 px-4 py-6 border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-4 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">BlogSocial</h1>
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
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={22} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
            <span>{item.label}</span>
          </button>
        )})}
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-auto font-medium"
      >
        <LogOut size={22} />
        <span>Đăng xuất</span>
      </button>
    </aside>
  );
};

export default Sidebar;