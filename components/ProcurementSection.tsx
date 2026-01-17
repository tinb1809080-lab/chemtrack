
import React from 'react';
import { Chemical } from '../types';
import * as XLSX from 'xlsx';

interface ProcurementSectionProps {
  chemicals: Chemical[];
}

const ProcurementSection: React.FC<ProcurementSectionProps> = ({ chemicals }) => {
  const lowStockChemicals = chemicals.filter(chem => {
    const totalQty = chem.lots
      .filter(l => l.status === 'RESERVED' || l.status === 'IN_USE')
      .reduce((acc, l) => acc + l.quantity, 0);
    return totalQty < (chem.minThreshold || 0);
  });

  const handleExportRequest = () => {
    const data = lowStockChemicals.map(chem => {
      const currentQty = chem.lots
        .filter(l => l.status === 'RESERVED' || l.status === 'IN_USE')
        .reduce((acc, l) => acc + l.quantity, 0);
      
      return {
        'Tên Hóa Chất': chem.name,
        'Công Thức': chem.formula,
        'Số CAS': chem.casNumber,
        'Tồn Hiện Tại': currentQty,
        'Đơn Vị': chem.lots[0]?.unit || '-',
        'Định Mức Tối Thiểu': chem.minThreshold,
        'Lượng Cần Mua (Gợi ý)': Math.max(0, (chem.minThreshold * 2) - currentQty),
        'Vị Trí': chem.location,
        'Nhà Cung Cấp': chem.supplier
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "PurchaseProposal");
    XLSX.writeFile(wb, `De_Nghi_Mua_Hang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Đề nghị mua hàng</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Danh sách hóa chất có tổng tồn kho dưới ngưỡng an toàn.</p>
        </div>
        <button 
          onClick={handleExportRequest}
          disabled={lowStockChemicals.length === 0}
          className={`flex items-center gap-3 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 ${lowStockChemicals.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fas fa-file-export text-lg"></i>
          XUẤT ĐỀ NGHỊ MUA HÀNG (EXCEL)
        </button>
      </div>

      {lowStockChemicals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl">
            <i className="fas fa-check-circle"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Kho hàng đầy đủ!</h3>
            <p className="text-slate-400 font-medium">Hiện tại không có hóa chất nào dưới ngưỡng tối thiểu.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Hóa chất</th>
                <th className="px-6 py-4 text-center">Định mức tối thiểu</th>
                <th className="px-6 py-4 text-center">Tồn kho hiện tại</th>
                <th className="px-6 py-4 text-center">Trạng thái thiếu</th>
                <th className="px-6 py-4 text-right">Lượng gợi ý mua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lowStockChemicals.map(chem => {
                const currentQty = chem.lots
                  .filter(l => l.status === 'RESERVED' || l.status === 'IN_USE')
                  .reduce((acc, l) => acc + l.quantity, 0);
                const shortage = (chem.minThreshold || 0) - currentQty;
                const unit = chem.lots[0]?.unit || '';
                
                return (
                  <tr key={chem.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm">{chem.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">CAS: {chem.casNumber} | {chem.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-500">
                      {chem.minThreshold} {unit}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-orange-600 bg-orange-50/30">
                      {currentQty.toFixed(2)} {unit}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-full">
                        Thiếu {shortage.toFixed(2)} {unit}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-indigo-700 text-lg italic">
                      {(chem.minThreshold * 2 - currentQty).toFixed(2)} <span className="text-xs font-normal text-slate-400">{unit}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs text-slate-400 font-bold italic">
              * Lượng gợi ý mua được tính bằng: (2 x Định mức) - Tồn hiện tại để đảm bảo dự trữ.
            </p>
            <p className="font-black text-slate-800 text-sm">
              Tổng cộng: <span className="text-indigo-600">{lowStockChemicals.length}</span> hóa chất cần nhập
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementSection;
