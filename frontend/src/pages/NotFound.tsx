import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Trang không tìm thấy</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc bạn cần đăng nhập để truy cập nội dung này.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
      >
        <Home size={20} />
        <span>Về trang chủ</span>
      </button>
    </div>
  );
};

export default NotFound;