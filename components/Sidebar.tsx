
import React from 'react';

interface SidebarProps {
  activeTab: 'inventory' | 'reports' | 'logs' | 'advisor';
  setActiveTab: (tab: 'inventory' | 'reports' | 'logs' | 'advisor') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: 'fa-flask' },
    { id: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
    { id: 'logs', label: 'Audit Logs', icon: 'fa-history' },
    { id: 'advisor', label: 'Safety AI', icon: 'fa-robot' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shadow-2xl">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
          <i className="fas fa-shield-virus"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">ChemTrack</h2>
          <span className="text-[10px] uppercase text-indigo-400 font-bold">Pro Enterprise</span>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 text-xs">
          <p className="text-slate-400 mb-2">STORAGE STATUS</p>
          <div className="h-1.5 w-full bg-slate-700 rounded-full mb-1">
            <div className="h-full w-[65%] bg-indigo-500 rounded-full"></div>
          </div>
          <p className="text-right text-slate-500">65% Capacity Used</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
