
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, setUserRole, searchQuery, setSearchQuery }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="Search by name, CAS, or ID..."
            className="w-full bg-gray-50 border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
           <select 
             value={userRole}
             onChange={(e) => setUserRole(e.target.value as UserRole)}
             className="text-xs bg-indigo-50 text-indigo-700 font-bold py-1 px-3 rounded-full border-none outline-none cursor-pointer"
           >
             <option value={UserRole.ADMIN}>Admin</option>
             <option value={UserRole.STAFF}>Staff</option>
             <option value={UserRole.VIEWER}>Viewer</option>
           </select>
        </div>

        <div className="flex items-center space-x-3 border-l pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">Lab Technician</p>
            <p className="text-xs text-gray-500">ID: CHEM-882</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            LT
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
