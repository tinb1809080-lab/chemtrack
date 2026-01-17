
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, searchQuery, setSearchQuery }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 no-print">
      <div className="flex-1 max-w-xl flex items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm tên, CAS, hoặc mã ID..."
            className="w-full bg-gray-50 border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 border-r pr-6">
          <div className="text-right">
            <p className="text-sm font-black text-gray-900 leading-none">{user.fullName}</p>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-red-600 transition-colors p-2"
          title="Đăng xuất"
        >
          <i className="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
