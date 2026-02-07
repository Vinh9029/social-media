import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import Feed from './components/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex justify-center">
              <Sidebar />
              <main className="flex-1 max-w-2xl w-full border-x border-gray-100 min-h-screen">
                <Routes>
                  <Route path="/" element={<Feed />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/post/:postId" element={<PostDetail />} />
                </Routes>
              </main>
              <Rightbar />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
