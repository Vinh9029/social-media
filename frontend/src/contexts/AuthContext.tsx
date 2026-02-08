import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { API_URL as BASE_URL } from '../config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = `${BASE_URL}/api/auth`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra phiên đăng nhập khi tải lại trang
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error checking login:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, full_name: fullName }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
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