import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
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
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Mail className="text-blue-600" /> Tin nhắn
      </h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors flex flex-col h-[500px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400">Chưa có tin nhắn nào.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === user.username ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${msg.from === user.username ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" onClick={() => {
              if (input.trim()) {
                sendMessage({ from: user.username, to: 'admin', content: input.trim() });
                setInput('');
              }
            }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;