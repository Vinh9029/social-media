import React, { useState, useEffect } from 'react';
import { Mail, Send, Search, MoreVertical, Phone, Video, Settings, Plus, Info, Image, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { Message, Conversation, User } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
  
  // State dữ liệu thực
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch danh sách cuộc trò chuyện
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // 2. Fetch tin nhắn khi chọn chat
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/api/messages/${selectedChat}`, {
            headers: { 'x-auth-token': token || '' }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentMessages(data);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
      
      // Tìm thông tin partner từ list conversation
      const conv = conversations.find(c => c.partnerId === selectedChat);
      if (conv) {
        setChatPartner({ id: conv.partnerId, name: conv.name, username: conv.username, avatar: conv.avatar } as User);
      }
    }
  }, [selectedChat, conversations]);

  // Xử lý khi được chuyển hướng từ trang Profile (nút Nhắn tin)
  useEffect(() => {
    if (location.state?.startChat) {
      const partner = location.state.startChat;
      setSelectedChat(partner.id);
      setChatPartner(partner);
      // Nếu chưa có trong list conversation, có thể thêm tạm vào UI nếu muốn
    }
  }, [location.state]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ 
          recipientId: selectedChat, 
          content: input 
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setCurrentMessages([...currentMessages, newMessage]);
        setInput('');
        fetchConversations(); // Refresh list để cập nhật last message
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleViewProfile = () => {
    if (chatPartner) navigate(`/profile/${chatPartner.id}`);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4 text-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Bạn cần đăng nhập để xem tin nhắn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh)] w-full bg-white dark:bg-slate-800 flex transition-colors">
        
        {/* Sidebar List */}
        <div className="w-[350px] border-r border-gray-100 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tin nhắn</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Tìm kiếm..." className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Chưa có cuộc trò chuyện nào</div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.partnerId}
                  onClick={() => setSelectedChat(conv.partnerId)}
                  className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedChat === conv.partnerId ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=random`} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.name}</h3>
                        <span className="text-xs text-gray-500">{formatDistanceToNow(conv.timestamp)}</span>
                      </div>
                      <p className={`text-sm truncate ${!conv.read && !conv.isSender ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conv.isSender ? 'Bạn: ' : ''}{conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-slate-900/30">
          {!selectedChat ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
               <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                 <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tin nhắn của bạn</h2>
               <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">Chọn một cuộc trò chuyện hoặc bắt đầu cuộc trò chuyện mới.</p>
             </div>
          ) : (
          <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleViewProfile}>
              <img 
                src={chatPartner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatPartner?.name || 'User')}&background=random`} 
                className="w-10 h-10 rounded-full object-cover" 
                alt="" 
              />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white hover:underline">
                  {chatPartner?.name || 'User'}
                </h3>
                <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Phone size={20} /></button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><Video size={20} /></button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">Bắt đầu cuộc trò chuyện...</div>
            ) : (
              currentMessages.map(msg => (
                <div key={msg._id} className={`flex ${msg.sender?._id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] shadow-sm ${msg.sender?._id === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button 
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 active:scale-95" 
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          </>
          )}
        </div>
    </div>
  );
};

export default Messages;