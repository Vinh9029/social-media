import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Bell className="text-blue-600" /> Thông báo</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 text-center transition-colors">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chưa có thông báo</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Khi có tương tác mới, chúng sẽ xuất hiện tại đây.</p>
      </div>
    </div>
  );
};

export default Notifications;