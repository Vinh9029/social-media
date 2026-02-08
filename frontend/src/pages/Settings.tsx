import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Settings as SettingsIcon, Moon, Sun, Shield, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (user) setDisplayName(user.name || '');
  }, [user]);

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({ name: displayName });
    if (error) showToast('Cập nhật thất bại', 'error');
    else showToast('Đã cập nhật thông tin', 'success');
  };

  const handleUpdatePassword = () => {
    // Giả lập logic đổi pass
    if (passwords.new !== passwords.confirm) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    showToast('Tính năng đổi mật khẩu đang phát triển', 'info');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem và chỉnh sửa cài đặt.</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <SettingsIcon className="text-blue-600" /> Cài đặt
      </h1>
      
      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <User size={20} className="text-blue-500" /> Thông tin tài khoản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên hiển thị</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input type="text" value={user.username} disabled className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={user.email || ''} disabled className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveProfile}
                disabled={displayName === user.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
        
        {/* Security */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-green-500" /> Bảo mật
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu hiện tại</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Xác nhận mật khẩu</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                {passwords.confirm && passwords.new !== passwords.confirm && <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleUpdatePassword}
                disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon size={20} className="text-purple-500" /> : <Sun size={20} className="text-orange-500" />} 
            Giao diện
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Chế độ tối (Dark Mode)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Điều chỉnh giao diện để bảo vệ mắt</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30 p-6 transition-colors">
          <h2 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-400 flex items-center gap-2">
            <LogOut size={20} /> Vùng nguy hiểm
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-300/80">Đăng xuất tài khoản khỏi tất cả các thiết bị hiện tại.</p>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
            Đăng xuất khỏi mọi thiết bị
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;