import React, { useState } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessagesContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const { messages, sendMessage } = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');

  if (!user) return null;

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ from: user.username, to: 'admin', content: input.trim() });
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="bg-white dark:bg-slate-800 w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full absolute bottom-0 right-0 border border-blue-600"></div>
                <MessageCircle size={20} />
              </div>
              <span className="font-semibold text-sm">Tin nhắn</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-blue-700 rounded"><Minus size={16} /></button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-700 rounded"><X size={16} /></button>
            </div>
          </div>

          {/* Body (Messages) */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900/50 space-y-3">
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

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Nhập tin nhắn..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" onClick={handleSend}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-blue-600/30 transition-all duration-300 active:scale-95 group"
      >
        {isOpen && !isMinimized ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} className="group-hover:animate-bounce" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;