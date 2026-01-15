
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const DEFAULT_USERS = [
  { username: 'admin', password: '123', fullName: 'Quản Trị Viên', role: UserRole.ADMIN },
  { username: 'staff', password: '123', fullName: 'Kỹ Thuật Viên 01', role: UserRole.STAFF }
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Giả lập xác thực (có thể thay bằng API thật)
    setTimeout(() => {
      const userFound = DEFAULT_USERS.find(u => u.username === username && u.password === password);
      
      if (userFound) {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          username: userFound.username,
          fullName: userFound.fullName,
          role: userFound.role
        };
        onLogin(user);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center text-white text-4xl shadow-2xl shadow-indigo-500/20 mb-6 border border-indigo-400/30">
            <i className="fas fa-shield-virus"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">ChemTrack Pro</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Hệ thống Quản lý Hóa chất Thông minh</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Tên đăng nhập</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="admin / staff"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <p className="text-red-500 text-xs font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 uppercase text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
              {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Phiên bản Doanh nghiệp v2.5.0</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-6">
           <p className="text-slate-500 text-[9px] font-bold">Lab: TECH-01</p>
           <p className="text-slate-500 text-[9px] font-bold">Node: VITE-642</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
