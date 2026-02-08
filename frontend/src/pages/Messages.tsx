import React, { useState } from 'react';
import { Mail, Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessagesContext';

const Messages = () => {
  const { user } = useAuth();
  const { messages, sendMessage } = useMessages();
  const [input, setInput] = useState('');

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
    <div className="max-w-2xl mx-auto w-full py-8 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden h-[600px] flex transition-colors">
        
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-gray-100 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tin nhắn</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Tìm kiếm..." className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Mock Conversation Item */}
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">A</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">Admin</h3>
                    <span className="text-xs text-gray-500">12:30</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Chào bạn, bạn cần giúp gì không?</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">A</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Admin</h3>
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
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 dark:bg-slate-900/50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">Bắt đầu cuộc trò chuyện...</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === user.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] shadow-sm ${msg.from === user.username ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'}`}>
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
                onKeyPress={e => e.key === 'Enter' && input.trim() && (sendMessage({ from: user.username, to: 'admin', content: input.trim() }), setInput(''))}
                className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button 
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 active:scale-95" 
                onClick={() => {
                  if (input.trim()) {
                    sendMessage({ from: user.username, to: 'admin', content: input.trim() });
                    setInput('');
                  }
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;