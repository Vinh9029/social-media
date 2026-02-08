import React from 'react';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    { id: 1, type: 'like', user: 'Nguyễn Văn A', content: 'đã thích bài viết của bạn.', time: '2 phút trước', read: false },
    { id: 2, type: 'comment', user: 'Trần Thị B', content: 'đã bình luận về bài viết của bạn.', time: '1 giờ trước', read: true },
    { id: 3, type: 'follow', user: 'Lê Văn C', content: 'đã bắt đầu theo dõi bạn.', time: '5 giờ trước', read: true },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Bell className="text-blue-600" /> Thông báo</h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                <div className={`p-2 rounded-full shrink-0 ${
                  notif.type === 'like' ? 'bg-red-100 text-red-600' : 
                  notif.type === 'comment' ? 'bg-blue-100 text-blue-600' : 
                  'bg-green-100 text-green-600'
                }`}>
                  {notif.type === 'like' && <Heart size={20} fill="currentColor" />}
                  {notif.type === 'comment' && <MessageCircle size={20} />}
                  {notif.type === 'follow' && <UserPlus size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">
                    <span className="font-bold">{notif.user}</span> {notif.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chưa có thông báo</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Khi có tương tác mới, chúng sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;