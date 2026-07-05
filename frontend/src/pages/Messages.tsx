import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, Search, MoreVertical, Phone, Video, ArrowLeft, Ban, Palette, Image as ImageIcon, Smile, X, Reply, CornerUpLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { Message, Conversation, User } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';
import ChatThemeModal, { ThemeConfig } from '../components/ChatThemeModal';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['🍌', '❤️', '😆', '😮', '😢', '😡'];

const Messages = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  
  // State dữ liệu thực
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Search & Block
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Theme State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);

  // New GUI states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 1. Fetch danh sách cuộc trò chuyện
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      // Add search query param
      const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`${API_URL}/api/messages/conversations${queryParam}`, {
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
            scrollToBottom();
            // Phát sự kiện để Sidebar cập nhật lại badge
            window.dispatchEvent(new Event('messages-read'));
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

      // Load theme
      const savedTheme = localStorage.getItem(`chat_theme_${selectedChat}`);
      if (savedTheme) {
        try {
          setCurrentTheme(JSON.parse(savedTheme));
        } catch (e) {}
      } else {
        setCurrentTheme(null);
      }
    }
  }, [selectedChat, conversations]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Xử lý khi được chuyển hướng từ trang Profile (nút Nhắn tin)
  useEffect(() => {
    if (location.state?.startChat) {
      const partner = location.state.startChat;
      
      // Kiểm tra xem đã có cuộc trò chuyện chưa
      const existingConv = conversations.find(c => c.partnerId === partner.id);
      
      if (existingConv) {
        setSelectedChat(existingConv.partnerId);
      } else {
        // Nếu chưa có, set state tạm để hiển thị UI chat rỗng
        setSelectedChat(partner.id);
        setChatPartner(partner);
      }
    }
  }, [location.state, conversations]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !selectedChat) return;

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
          content: input,
          image: selectedImage || undefined,
          replyTo: replyToMessage ? replyToMessage.id || replyToMessage._id : undefined
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setCurrentMessages([...currentMessages, newMessage]);
        scrollToBottom();
        setInput('');
        setSelectedImage(null);
        setReplyToMessage(null);
        fetchConversations(); // Refresh list để cập nhật last message
      }
      if (res.status === 403) {
        showToast('Không thể gửi tin nhắn (đã bị chặn)', 'error');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedChat) return;
    if (!window.confirm('Bạn có chắc chắn muốn chặn người dùng này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/users/block/${selectedChat}`, {
        method: 'PUT',
        headers: { 'x-auth-token': token || '' }
      });
      showToast('Đã chặn người dùng', 'success');
      setShowMenu(false);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleViewProfile = () => {
    if (chatPartner) navigate(`/profile/${chatPartner.id}`);
  };

  const handleSelectTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    if (selectedChat) {
      localStorage.setItem(`chat_theme_${selectedChat}`, JSON.stringify(theme));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token || '' 
        },
        body: JSON.stringify({ type: emoji })
      });
      if (res.ok) {
        const newReactions = await res.json();
        setCurrentMessages(prev => prev.map(m => (m.id === messageId || m._id === messageId) ? { ...m, reactions: newReactions } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4 text-center">
        <div className="bg-slate-900 rounded-3xl p-12 shadow-2xl border border-white/5 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-400 mb-6">Bạn cần đăng nhập để xem tin nhắn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen w-full bg-slate-900 flex transition-colors overflow-hidden text-white">
        
        {/* Sidebar List */}
        <div className={`${isSidebarCollapsed ? 'hidden' : selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] border-r border-white/5 flex-col bg-slate-900`}>
          <div className="p-4 border-b border-white/5">
            <h2 className="text-xl font-bold text-white mb-4">Tin nhắn</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                  className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${selectedChat === conv.partnerId ? 'bg-purple-900/10 border-r-4 border-purple-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=random`} alt={conv.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-white truncate">{conv.name}</h3>
                        <span className="text-[11px] text-gray-400">{formatDistanceToNow(conv.timestamp)}</span>
                      </div>
                      <p className={`text-xs truncate ${!conv.read && !conv.isSender ? 'font-bold text-purple-400' : 'text-gray-400'}`}>
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
        <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-950`}>
          {!selectedChat ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
               <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                 <Mail className="w-10 h-10 text-purple-500" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Tin nhắn của bạn</h2>
               <p className="text-gray-400 max-w-xs mb-8">Chọn một cuộc trò chuyện hoặc bắt đầu cuộc trò chuyện mới.</p>
             </div>
          ) : (
          <>
          {/* Chat Header */}
          <div className="p-3 md:p-4 border-b border-white/5 flex justify-between items-center bg-slate-900 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 -ml-2 text-gray-300"><ArrowLeft size={20} /></button>
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                className="hidden md:flex p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white mr-1"
                title={isSidebarCollapsed ? "Hiện danh sách chat" : "Ẩn danh sách chat"}
              >
                <ArrowLeft size={20} className={`transform transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleViewProfile}>
                <img 
                  src={chatPartner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatPartner?.name || 'User')}&background=random`} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" 
                  alt="" 
                />
                <div>
                  <h3 className="font-bold text-white hover:underline">
                    {chatPartner?.name || 'User'}
                  </h3>
                  <p className="text-[11px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Phone size={20} /></button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Video size={20} /></button>
              <button onClick={() => setIsThemeModalOpen(true)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Palette size={20} /></button>
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><MoreVertical size={20} /></button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 rounded-xl shadow-xl border border-white/5 py-1 z-20">
                    <button onClick={handleViewProfile} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5">Xem hồ sơ</button>
                    <button onClick={handleBlockUser} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2"><Ban size={14} /> Chặn tin nhắn</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div 
            className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-950 scroll-smooth relative"
            style={{
              ...(currentTheme?.type === 'color' ? { background: currentTheme.value } : {}),
            }}
          >
            {/* Background Image Overlay */}
            {currentTheme?.type === 'image' && (
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${currentTheme.value}')`, opacity: 0.15 }}
              />
            )}
            
            <div className="relative z-10 space-y-5">
              {currentMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">Bắt đầu cuộc trò chuyện...</div>
              ) : (
              currentMessages.map(msg => {
                const isMe = msg.sender?.id === user.id || msg.sender?._id === user.id;
                const msgId = msg.id || msg._id;
                return (
                  <div 
                    key={msgId} 
                    className={`flex items-end gap-3 group relative ${isMe ? 'justify-end pr-1' : 'justify-start pl-1'}`}
                    onMouseEnter={() => setHoveredMessageId(msgId)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {/* Partner avatar */}
                    {!isMe && (
                      <img 
                        src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'User')}&background=random`} 
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 mb-1 flex-shrink-0" 
                        alt="partner avatar"
                      />
                    )}
                    
                    <div className="flex flex-col max-w-[70%]">
                      {/* Reply To Display */}
                      {msg.replyTo && (
                        <div className={`text-xs p-2 rounded-xl mb-1 truncate ${isMe ? 'bg-white/5 text-gray-400 self-end' : 'bg-slate-800 text-gray-400'}`}>
                          <span className="font-bold">Đang trả lời {msg.replyTo.sender?.name}:</span> {msg.replyTo.content}
                        </div>
                      )}

                      <div className="relative">
                        <div className={`px-4 py-2.5 rounded-2xl text-sm break-words relative shadow-md transition-all duration-200 ${
                          isMe 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-white rounded-bl-none border border-white/5'
                        }`}>
                          {msg.content}
                          
                          {/* Image Attachment inside Bubble */}
                          {msg.image && (
                            <img src={msg.image} alt="Attachment" className="mt-2 rounded-xl max-w-full h-auto max-h-60 object-cover cursor-zoom-in" />
                          )}
                        </div>

                        {/* Reactions displays on bubble */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`absolute -bottom-2 flex gap-0.5 bg-slate-900 border border-white/10 rounded-full px-1.5 py-0.5 text-xs shadow-md ${isMe ? 'right-2' : 'left-2'}`}>
                            {msg.reactions.map((r: any, i: number) => (
                              <span key={i} title="Người thả cảm xúc" className="cursor-default">{r.type}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {hoveredMessageId === msgId && (
                        <span className={`text-[10px] text-gray-400 mt-1 select-none transition-all duration-200 ${isMe ? 'self-end' : 'self-start'}`}>
                          {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* My avatar */}
                    {isMe && (
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} 
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 mb-1 flex-shrink-0" 
                        alt="my avatar"
                      />
                    )}

                    {/* Reactions & Reply Panel on Hover */}
                    {hoveredMessageId === msgId && (
                      <div className={`flex items-center gap-1.5 bg-slate-900/90 border border-white/10 rounded-full px-2 py-1 shadow-lg absolute z-20 -top-8 ${isMe ? 'right-12' : 'left-12'}`}>
                        {EMOJIS.map(emoji => (
                          <button 
                            key={emoji} 
                            onClick={() => handleReactMessage(msgId, emoji)}
                            className="hover:scale-125 transition-transform text-[15px]"
                          >
                            {emoji}
                          </button>
                        ))}
                        <div className="w-[1px] h-4 bg-white/20 mx-1" />
                        <button 
                          onClick={() => setReplyToMessage(msg)}
                          className="hover:text-purple-400 text-gray-400 p-0.5 rounded transition-colors"
                          title="Trả lời"
                        >
                          <Reply size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply Banner preview above input */}
          {replyToMessage && (
            <div className="px-4 py-2 bg-slate-800 border-t border-white/5 flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-1 truncate">
                <CornerUpLeft size={14} className="text-purple-400" />
                <span className="font-semibold text-white">Đang trả lời {replyToMessage.sender?.name}:</span>
                <span className="truncate italic">"{replyToMessage.content}"</span>
              </div>
              <button onClick={() => setReplyToMessage(null)} className="p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Selected Image Preview above input */}
          {selectedImage && (
            <div className="px-4 py-3 bg-slate-800/80 border-t border-white/5 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                <img src={selectedImage} className="w-full h-full object-cover" alt="Selected Preview" />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute top-0.5 right-0.5 p-1 bg-black/70 rounded-full hover:bg-black text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="text-xs text-gray-400">Hình ảnh đã chọn</span>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-slate-900 border-t border-white/5 relative">
            
            {/* Simple Emojis Popup */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-3 right-4 bg-slate-800 border border-white/10 rounded-2xl p-3 grid grid-cols-6 gap-2 shadow-2xl z-30"
                >
                  {['😊','😂','❤️','🔥','👍','🎉','🤔','😮','😢','😡','🌟','🙌'].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }}
                      className="text-xl hover:scale-125 transition-transform p-1.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              {/* Image attachment button */}
              <label className="p-3 hover:bg-white/5 rounded-full text-gray-400 hover:text-purple-400 transition-colors cursor-pointer active:scale-90">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {/* Emoji Picker Button */}
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="p-3 hover:bg-white/5 rounded-full text-gray-400 hover:text-purple-400 transition-colors active:scale-90"
              >
                <Smile size={20} />
              </button>

              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-500"
              />
              <button 
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/20 transition-colors active:scale-95" 
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          </>
          )}
        </div>
        
        <ChatThemeModal 
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
        />
    </div>
  );
};

export default Messages;