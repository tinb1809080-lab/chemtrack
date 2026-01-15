
import React from 'react';
import { Chemical } from '../types';

interface DashboardProps {
  chemicals: Chemical[];
}

const Dashboard: React.FC<DashboardProps> = ({ chemicals }) => {
  const allLots = chemicals.flatMap(c => c.lots);
  
  const inStockCount = allLots.filter(l => l.status === 'RESERVED' || l.status === 'IN_USE').length;
  const expiredCount = allLots.filter(l => l.status === 'EXPIRED').length;
  const consumedCount = allLots.filter(l => l.status === 'CONSUMED').length;

  const stats = [
    { label: 'Hóa chất Tồn kho', value: inStockCount, icon: 'fa-box-open', color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Đang sẵn dụng' },
    { label: 'Cảnh báo Thanh lý', value: expiredCount, icon: 'fa-radiation', color: 'text-red-600', bg: 'bg-red-50', sub: 'Hết hạn sử dụng' },
    { label: 'Lô đã tiêu thụ', value: consumedCount, icon: 'fa-check-double', color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Đã dùng hết' },
    { label: 'Hóa chất Master', value: chemicals.length, icon: 'fa-flask', color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Danh mục quản lý' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-5 transition-all hover:shadow-md">
          <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
            <i className={`fas ${stat.icon}`}></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 leading-tight">{stat.value}</p>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5 italic">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
