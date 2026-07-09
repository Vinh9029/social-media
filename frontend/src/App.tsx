import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import Feed from './components/Feed';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Saved from './pages/Saved';
import Settings from './pages/Settings';
import SearchPage from './pages/Search';
import NotFound from './pages/NotFound';
import ChatWidget from './components/ChatWidget';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { MessagesProvider } from './contexts/MessagesContext';



const GlobalBlocker = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const [status, setStatus] = React.useState(user?.status || 'active');

  React.useEffect(() => {
    if (!user) return;
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/users/${user.id || (user as any)._id}`, {
          headers: { 'x-auth-token': token || '' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status) setStatus(data.status);
        }
      } catch (e) { }
    };
    fetchStatus();
  }, [user]);

  if (status === 'deactivated') {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-3xl border border-red-500/30 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Tài khoản bị vô hiệu hóa</h1>
          <p className="text-slate-400 mb-8">
            Tài khoản của bạn đã bị quản trị viên khóa do vi phạm tiêu chuẩn cộng đồng.
          </p>
          <button
            onClick={() => {
              signOut();
              window.location.href = '/login';
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl w-full"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isProfilePage = location.pathname === '/profile' || location.pathname.startsWith('/profile/');
  const isMessagesPage = location.pathname === '/messages';
  const isSearchPage = location.pathname === '/search';
  const hideRightbar = isProfilePage || isMessagesPage || isSearchPage;

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, [location]);

  React.useEffect(() => {
    if (user && user.role === 'admin' && location.pathname !== '/admin') {
      navigate('/admin');
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center transition-colors duration-200">
      <Sidebar />
      <main className={`flex-1 w-full border-x border-gray-100 dark:border-slate-800 min-h-screen ${hideRightbar ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideRightbar && <Rightbar />}
      {!isMessagesPage && <ChatWidget />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MessagesProvider>
              <GlobalBlocker>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<MainLayout />} />
                </Routes>
              </GlobalBlocker>
            </MessagesProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
