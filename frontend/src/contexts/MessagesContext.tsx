import React, { createContext, useContext, useState } from 'react';

export type Message = {
  id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
};

interface MessagesContextType {
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = (msg: Omit<Message, 'id' | 'createdAt'>) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: Date.now().toString(), createdAt: new Date().toISOString() }
    ]);
  };

  return (
    <MessagesContext.Provider value={{ messages, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) throw new Error('useMessages must be used within a MessagesProvider');
  return context;
};
