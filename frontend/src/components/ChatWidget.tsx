import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { Message, Conversation } from '../types';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  
  // State dữ liệu thật
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentConversation, setRecentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch cuộc trò chuyện gần nhất khi mở widget
  useEffect(() => {
    if (isOpen && !isMinimized) {
      fetchRecentChat();
    }
  }, [isOpen, isMinimized]);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const fetchRecentChat = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Lấy danh sách hội thoại
      const convRes = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'x-auth-token': token || '' }
      });
      if (convRes.ok) {
        const conversations = await convRes.json();
        if (conversations.length > 0) {
          const lastConv = conversations[0];
          setRecentConversation(lastConv);
          
          // 2. Lấy tin nhắn của hội thoại gần nhất
          const msgRes = await fetch(`${API_URL}/api/messages/${lastConv.partnerId}`, {
            headers: { 'x-auth-token': token || '' }
          });
          if (msgRes.ok) {
            const msgs = await msgRes.json();
            setMessages(msgs);
          }
        }
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
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full absolute bottom-0 right-0 border border-blue-600"></div>
                <MessageCircle size={20} />
              </div>
              <span className="font-semibold text-sm">{recentConversation ? recentConversation.name : 'Tin nhắn'}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-blue-700 rounded"><Minus size={16} /></button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-700 rounded"><X size={16} /></button>
            </div>
          </div>

          {/* Body (Messages) */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-900/50 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-10">Chưa có tin nhắn nào gần đây.</div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className={`flex ${msg.sender?._id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${msg.sender?._id === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
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
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50" 
                onClick={handleSend}
                disabled={!input.trim() || !recentConversation}
              >
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