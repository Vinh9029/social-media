import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { Message, Conversation } from '../types';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [view, setView] = useState<'list' | 'chat'>('list'); // 'list' or 'chat'
  
  // State dữ liệu thật
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentConversation, setRecentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch danh sách cuộc trò chuyện khi mở widget
  useEffect(() => {
    if (isOpen && !isMinimized) {
      fetchConversations();
    }
  }, [isOpen, isMinimized]);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const convRes = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (convRes.ok) {
        const data = await convRes.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const openChat = async (conv: Conversation) => {
    setRecentConversation(conv);
    setView('chat');
    try {
      const token = localStorage.getItem('token');
      const msgRes = await fetch(`${API_URL}/api/messages/${conv.partnerId}`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setMessages(msgs);
      }
    } catch (error) {
      console.error("Error fetching chat widget data:", error);
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !recentConversation) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ 
          recipientId: recentConversation.partnerId, 
          content: input.trim() 
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages([...messages, newMessage]);
        setInput('');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="bg-white dark:bg-slate-800 w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              {view === 'chat' ? (
                <button onClick={() => setView('list')} className="hover:bg-blue-700 p-1 rounded"><ArrowLeft size={18} /></button>
              ) : (
                <MessageCircle size={20} />
              )}
              <span className="font-semibold text-sm truncate max-w-[150px]">
                {view === 'chat' && recentConversation ? recentConversation.name : 'Tin nhắn'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-blue-700 rounded"><Minus size={16} /></button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-700 rounded"><X size={16} /></button>
            </div>
          </div>

          {/* Body */}
          {view === 'list' ? (
            // LIST VIEW
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10 p-4">Chưa có cuộc trò chuyện nào.</div>
              ) : (
                conversations.map(conv => (
                  <div 
                    key={conv.partnerId} 
                    onClick={() => openChat(conv)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-50 dark:border-slate-700/50"
                  >
                    <div className="relative">
                      <img src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=random`} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{conv.name}</h4>
                      <p className={`text-xs truncate ${!conv.read && !conv.isSender ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conv.isSender ? 'Bạn: ' : ''}{conv.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // CHAT VIEW
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 dark:bg-slate-900/50 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10">Bắt đầu cuộc trò chuyện...</div>
              ) : (
                messages.map(msg => (
                  <div key={msg._id} className={`flex ${msg.sender?._id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words ${msg.sender?._id === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer */}
          {view === 'chat' && (
            <div className="p-2 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập tin nhắn..." 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  autoFocus
                />
                <button 
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50" 
                  onClick={handleSend}
                  disabled={!input.trim() || !recentConversation}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
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