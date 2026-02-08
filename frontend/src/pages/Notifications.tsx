import React, { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, MessageSquare, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useToast } from '../contexts/ToastContext';

type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'new_post';

interface Notification {
  _id: string;
  type: NotificationType;
  sender: {
    _id: string;
    full_name: string;
    avatar_url?: string;
    username: string;
  };
  content: string;
  post?: string; // ID bài viết
  commentId?: string;
  createdAt: string;
  read: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('Đã đánh dấu tất cả là đã đọc', 'success');
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif._id);
    }
    
    if (notif.type === 'follow') {
      navigate(`/profile/${notif.sender._id}`);
    } else if (notif.post) {
      navigate(`/post/${notif.post}`);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'like': return <Heart size={18} fill="currentColor" />;
      case 'comment': return <MessageCircle size={18} />;
      case 'reply': return <MessageSquare size={18} />;
      case 'follow': return <UserPlus size={18} />;
      case 'new_post': return <Bell size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getColorClass = (type: NotificationType) => {
    switch (type) {
      case 'like': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'comment': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'reply': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'follow': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'new_post': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Bell className="text-blue-600" /> Thông báo</h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải thông báo...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
              >
                <div className="relative shrink-0">
                  <img 
                    src={notif.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.full_name || 'User')}&background=random`} 
                    alt={notif.sender?.full_name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-600"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-slate-800 ${getColorClass(notif.type)}`}>
                    {React.cloneElement(getIcon(notif.type) as React.ReactElement, { size: 12 })}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">
                    <span className="font-bold hover:underline cursor-pointer" onClick={(e) => { 
                      e.stopPropagation(); 
                      if (notif.sender?._id) navigate(`/profile/${notif.sender._id}`);
                    }}>
                      {notif.sender?.full_name || 'Unknown User'}
                    </span> {notif.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDistanceToNow(notif.createdAt)}</p>
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