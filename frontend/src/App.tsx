import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import Feed from './components/Feed';
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
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

const MainLayout = () => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex justify-center transition-colors duration-200">
      <Sidebar />
      <main className={`flex-1 w-full border-x border-gray-100 dark:border-slate-800 min-h-screen ${isProfilePage ? 'max-w-4xl' : 'max-w-2xl'}`}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {!isProfilePage && <Rightbar />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<MainLayout />} />
            </Routes>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
