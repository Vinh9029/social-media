import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Admin User',
  username: 'admin',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
  role: 'admin',
  bio: 'Full Stack Developer | UI/UX Enthusiast'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Giả lập delay mạng
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(MOCK_USER);
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Đăng ký xong tự động đăng nhập luôn
    setUser({ ...MOCK_USER, name: fullName || 'New User', username });
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}