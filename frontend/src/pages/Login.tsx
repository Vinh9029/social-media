import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Github, Chrome, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorMsg = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/';
    } else if (errorMsg) {
      setError('Đăng nhập thất bại: ' + errorMsg);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Failed to login');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-screen flex bg-slate-900 overflow-hidden">

      {/* Left side: Branding & Hero section */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
      >
        {/* Image Background with 70% opacity overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/login_background.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-slate-900/90 backdrop-blur-[2px]"></div>

        {/* Background abstract shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white rounded-full mix-blend-overlay filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-300 rounded-full mix-blend-overlay filter blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="flex items-center gap-3 text-white"
          >
            <Sparkles className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">DX Social Community</span>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-extrabold text-white leading-tight mb-6"
          >
            Kết nối với thế giới của bạn.
          </motion.h1>
          <motion.p
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg text-white/80"
          >
            Tham gia cộng đồng để chia sẻ những khoảnh khắc tuyệt vời, cập nhật tin tức và trò chuyện cùng bạn bè.
          </motion.p>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">© 2026 DXSocial Community. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 relative">
        {/* Mobile abstract backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-2xl bg-white/5 lg:bg-transparent lg:border-none border border-white/10 rounded-[2rem] p-8 lg:p-0 shadow-2xl lg:shadow-none">
            <div className="text-center lg:text-left mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Chào mừng trở lại</h2>
              <p className="text-gray-400">Đăng nhập để tiếp tục</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  placeholder="••••••••"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </motion.button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-slate-900 lg:bg-slate-900 text-gray-500">Hoặc tiếp tục với</span></div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <Chrome className="w-5 h-5 text-gray-300" />
                  <span>Google</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGithubLogin}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <Github className="w-5 h-5 text-gray-300" />
                  <span>GitHub</span>
                </motion.button>
              </div>
            </div>

            <p className="mt-10 text-center text-gray-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}