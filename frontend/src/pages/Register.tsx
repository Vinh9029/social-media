import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Mật khẩu phải dài ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    const { error, user } = await signUp(email, password, username, fullName);

    if (error) {
      setError(error.message || 'Đăng ký thất bại');
      setLoading(false);
    } else {
      setLoading(false);
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
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
            Bắt đầu hành trình của bạn.
          </motion.h1>
          <motion.p
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg text-white/80"
          >
            Tạo tài khoản và tham gia cùng hàng ngàn thành viên khác chia sẻ các khoảnh khắc tuyệt vời mỗi ngày.
          </motion.p>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">© 2026 DXSocial Community. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right side: Register Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Mobile abstract backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md my-8"
        >
          <div className="backdrop-blur-2xl bg-white/5 lg:bg-transparent lg:border-none border border-white/10 rounded-[2rem] p-8 lg:p-0 shadow-2xl lg:shadow-none">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Đăng ký tài khoản</h2>
              <p className="text-gray-400">Tham gia cộng đồng ngay hôm nay</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Tên tài khoản (Username)
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  placeholder="vinhdeptrainhatsom"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  placeholder="vinhdeptrai"
                />
              </div>

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
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  placeholder="vinhdeptrai@example.com"
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
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang tạo tài khoản...
                  </span>
                ) : (
                  'Đăng ký'
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}