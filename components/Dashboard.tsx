
import React from 'react';
import { Chemical } from '../types';

interface DashboardProps {
  chemicals: Chemical[];
  onExportExcel: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ chemicals, onExportExcel }) => {
  const allLots = chemicals.flatMap(c => c.lots);
  const today = new Date();
  
  const inStockCount = allLots.filter(l => l.status === 'RESERVED' || l.status === 'IN_USE').length;
  
  const expiredCount = allLots.filter(l => {
    if (l.status !== 'RESERVED' && l.status !== 'IN_USE') return false;
    const nsxExp = new Date(l.expiryDate);
    let paoExp: Date | null = null;
    if (l.openedDate && l.paoDays) {
       paoExp = new Date(new Date(l.openedDate).getTime() + l.paoDays * 24 * 60 * 60 * 1000);
    }
    return nsxExp < today || (paoExp && paoExp < today);
  }).length;

  const lowStockCount = chemicals.filter(c => {
    const totalQty = c.lots
      .filter(l => l.status === 'RESERVED' || l.status === 'IN_USE')
      .reduce((acc, l) => acc + l.quantity, 0);
    return totalQty > 0 && totalQty < (c.minThreshold || 0);
  }).length;

  const stats = [
    { label: 'Tồn kho khả dụng', value: inStockCount - expiredCount, icon: 'fa-check-double', color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Hóa chất sẵn dùng' },
    { label: 'Sắp hết hàng', value: lowStockCount, icon: 'fa-box-open', color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Dưới định mức' },
    { label: 'Cảnh báo Hết hạn', value: expiredCount, icon: 'fa-radiation-alt', color: 'text-red-600', bg: 'bg-red-50', sub: 'Cần thanh lý gấp' },
    { label: 'Tổng mục Master', value: chemicals.length, icon: 'fa-flask', color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Danh mục quản lý' },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-5 transition-all hover:shadow-md">
            <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className={`text-3xl font-black leading-tight ${stat.value > 0 && stat.color === 'text-red-600' ? 'animate-bounce' : 'text-slate-900'}`}>{stat.value}</p>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5 italic">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={onExportExcel}
          className="flex items-center gap-3 bg-white border border-emerald-200 text-emerald-700 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-emerald-50 transition-all group"
        >
          <i className="fas fa-file-excel text-lg group-hover:scale-110 transition-transform"></i>
          XUẤT BÁO CÁO TỒN KHO & HẠN DÙNG
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
