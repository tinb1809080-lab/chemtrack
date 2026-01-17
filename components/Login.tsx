
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  onUpdateUsers: (newUsers: User[]) => void;
}

type Mode = 'LOGIN' | 'SIGNUP' | 'FORGOT' | 'RESET';

const Login: React.FC<LoginProps> = ({ onLogin, users, onUpdateUsers }) => {
  const [mode, setMode] = useState<Mode>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      if (mode === 'LOGIN') {
        const userFound = users.find(u => (u.username === username || u.email === username) && u.password === password);
        if (userFound) {
          onLogin(userFound);
        } else {
          setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
          setLoading(false);
        }
      } else if (mode === 'SIGNUP') {
        if (users.some(u => u.username === username || u.email === email)) {
          setError('Tên đăng nhập hoặc Email đã tồn tại!');
          setLoading(false);
          return;
        }
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          username,
          password,
          fullName,
          email,
          role: users.length === 0 ? UserRole.ADMIN : UserRole.STAFF
        };
        onUpdateUsers([...users, newUser]);
        setSuccess('Đăng ký thành công! Hãy đăng nhập.');
        setMode('LOGIN');
        setLoading(false);
      } else if (mode === 'FORGOT') {
        const userFound = users.find(u => u.email === email);
        if (userFound) {
          setTargetUser(userFound);
          setSuccess('Mã xác nhận đã được gửi đến Gmail của bạn (Giả lập: 1234)');
          setMode('RESET');
        } else {
          setError('Email không tồn tại trong hệ thống!');
        }
        setLoading(false);
      } else if (mode === 'RESET') {
        if (resetCode === '1234' && targetUser) {
          const updatedUsers = users.map(u => 
            u.id === targetUser.id ? { ...u, password } : u
          );
          onUpdateUsers(updatedUsers);
          setSuccess('Đổi mật khẩu thành công! Hãy đăng nhập.');
          setMode('LOGIN');
        } else {
          setError('Mã xác nhận không đúng!');
        }
        setLoading(false);
      }
    }, 1000);
  };

  const renderTitle = () => {
    switch(mode) {
      case 'SIGNUP': return 'Tạo tài khoản mới';
      case 'FORGOT': return 'Khôi phục mật khẩu';
      case 'RESET': return 'Thiết lập mật khẩu mới';
      default: return 'Chào mừng trở lại';
    }
  };

  const renderSubtitle = () => {
    switch(mode) {
      case 'SIGNUP': return 'Tham gia hệ thống quản lý phòng Lab';
      case 'FORGOT': return 'Liên kết Gmail để nhận mã xác minh';
      case 'RESET': return 'Nhập mã từ Gmail và mật khẩu mới';
      default: return 'Hệ thống Quản lý Hóa chất Thông minh';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 overflow-y-auto py-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-500/20 mb-6 border border-indigo-400/30">
            <i className="fas fa-shield-virus"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">ChemTrack Pro</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">Smart Lab Management System</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="mb-8">
             <h2 className="text-2xl font-black text-white">{renderTitle()}</h2>
             <p className="text-slate-400 text-xs mt-1 font-medium">{renderSubtitle()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'SIGNUP' && (
              <>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </>
            )}

            {(mode === 'LOGIN' || mode === 'SIGNUP') && (
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tên đăng nhập</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="admin"
                  required
                />
              </div>
            )}

            {(mode === 'SIGNUP' || mode === 'FORGOT') && (
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Gmail liên kết</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            )}

            {mode === 'RESET' && (
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mã xác minh (Gửi tới Gmail)</label>
                <input 
                  type="text" 
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white font-black text-center tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                  placeholder="----"
                  maxLength={4}
                  required
                />
              </div>
            )}

            {(mode === 'LOGIN' || mode === 'SIGNUP' || mode === 'RESET') && (
              <div>
                <div className="flex justify-between items-end mb-1.5 ml-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mật khẩu</label>
                  {mode === 'LOGIN' && (
                    <button type="button" onClick={() => setMode('FORGOT')} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Quên?</button>
                  )}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 animate-shake">
                <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
                <p className="text-red-500 text-[11px] font-bold">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                <p className="text-emerald-500 text-[11px] font-bold">{success}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-arrow-right"></i>}
              {loading ? 'Đang xử lý...' : mode === 'LOGIN' ? 'Đăng nhập ngay' : mode === 'SIGNUP' ? 'Đăng ký tài khoản' : mode === 'FORGOT' ? 'Gửi mã xác minh' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            {mode === 'LOGIN' ? (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Chưa có tài khoản? <button onClick={() => setMode('SIGNUP')} className="text-indigo-400 hover:text-indigo-300">Tham gia ngay</button>
              </p>
            ) : (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Quay lại màn hình <button onClick={() => setMode('LOGIN')} className="text-indigo-400 hover:text-indigo-300">Đăng nhập</button>
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-6 opacity-40">
           <p className="text-slate-500 text-[9px] font-bold">Lab: TECH-01</p>
           <p className="text-slate-500 text-[9px] font-bold">Ver: 2.5.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
