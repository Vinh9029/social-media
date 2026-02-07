import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><SettingsIcon className="text-blue-600" /> Cài đặt</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Thông tin tài khoản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
              <input type="text" value={user?.name || ''} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={user?.username || ''} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50">
          <h3 className="text-sm font-medium text-red-600 mb-2">Vùng nguy hiểm</h3>
          <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
            Đăng xuất khỏi mọi thiết bị
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;