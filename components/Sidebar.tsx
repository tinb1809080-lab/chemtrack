
import React, { useState } from 'react';

interface SidebarProps {
  activeTab: 'inventory' | 'consumed' | 'disposal' | 'logs' | 'advisor' | 'system' | 'procurement';
  setActiveTab: (tab: 'inventory' | 'consumed' | 'disposal' | 'logs' | 'advisor' | 'system' | 'procurement') => void;
  subTab: string;
  setSubTab: (sub: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, subTab, setSubTab }) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(activeTab);

  const menuItems = [
    { 
      id: 'inventory', 
      label: 'Kho hiện tại', 
      icon: 'fa-flask',
      subs: [
        { id: 'all', label: 'Tất cả hóa chất' },
        { id: 'solid', label: 'Hóa chất rắn' },
        { id: 'liquid', label: 'Hóa chất lỏng' },
        { id: 'hazardous', label: 'Nguy hiểm cao' }
      ]
    },
    { 
      id: 'procurement', 
      label: 'Đề nghị mua hàng', 
      icon: 'fa-shopping-cart',
      subs: [
        { id: 'all', label: 'Sắp hết hàng' }
      ]
    },
    { 
      id: 'consumed', 
      label: 'Đã sử dụng hết', 
      icon: 'fa-check-circle',
      subs: [
        { id: 'all', label: 'Lịch sử tiêu thụ' }
      ]
    },
    { 
      id: 'disposal', 
      label: 'Thanh lý/Hết hạn', 
      icon: 'fa-trash-alt',
      subs: [
        { id: 'all', label: 'Tất cả quá hạn' }
      ]
    },
    { id: 'advisor', label: 'AI Advisor', icon: 'fa-robot' },
    { id: 'logs', label: 'Nhật ký', icon: 'fa-history' },
    { id: 'system', label: 'Hệ thống', icon: 'fa-cogs' },
  ];

  const handleMainMenuClick = (id: string) => {
    setActiveTab(id as any);
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shadow-2xl relative z-20 no-print border-r border-slate-800">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
          <i className="fas fa-shield-virus"></i>
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">ChemTrack</h2>
          <span className="text-[9px] uppercase text-indigo-400 font-black tracking-widest leading-none">Smart Lab Pro</span>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => handleMainMenuClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className={`fas ${item.icon} w-5 text-sm`}></i>
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {item.subs && (
                <i className={`fas fa-chevron-right text-[10px] transition-transform duration-300 ${expandedMenu === item.id ? 'rotate-90' : ''}`}></i>
              )}
            </button>

            {item.subs && expandedMenu === item.id && (
              <div className="ml-9 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                {item.subs.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => { setSubTab(sub.id); setActiveTab(item.id as any); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      subTab === sub.id && activeTab === item.id
                        ? 'text-indigo-400 bg-indigo-400/5'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <span className="mr-2 opacity-50">•</span>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex justify-between items-center mb-2">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Data Status</p>
             <span className="text-[10px] font-black text-emerald-400">OFFLINE OK</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[100%] bg-emerald-500 rounded-full"></div>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 mt-4 text-center font-bold italic">Version 2.6.0 - Pharma Edition</p>
      </div>
    </aside>
  );
};

export default Sidebar;
