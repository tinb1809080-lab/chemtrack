
import React, { useState } from 'react';
import { Chemical, UserRole, PhysicalState, ChemicalLot, AuditLog } from '../types';
import NFPADiamond from './NFPADiamond';

interface ChemicalListProps {
  chemicals: Chemical[];
  auditLogs: AuditLog[];
  userRole: UserRole;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onLotAction: (chemId: string, lotId: string, action: 'OPEN' | 'USAGE' | 'STOCK_IN' | 'DISPOSE' | 'CONSUME_ALL', amount?: number, customDate?: string) => void;
  onAddLot: (chemId: string) => void;
}

const ChemicalList: React.FC<ChemicalListProps> = ({ chemicals, auditLogs, userRole, onEdit, onDelete, onLotAction, onAddLot }) => {
  const [expandedChem, setExpandedChem] = useState<string | null>(null);
  const [showLotHistory, setShowLotHistory] = useState<string | null>(null);
  const [transactionAmounts, setTransactionAmounts] = useState<{[key: string]: string}>({});
  const [transactionDates, setTransactionDates] = useState<{[key: string]: string}>({});

  const todayStr = new Date().toISOString().split('T')[0];

  const calculateActualExpiry = (lot: ChemicalLot) => {
    if (!lot.openedDate || !lot.paoDays) return lot.expiryDate;
    const opened = new Date(lot.openedDate);
    const paoExpiry = new Date(opened.getTime() + lot.paoDays * 24 * 60 * 60 * 1000);
    const originalExpiry = new Date(lot.expiryDate);
    return paoExpiry < originalExpiry ? paoExpiry.toISOString().split('T')[0] : lot.expiryDate;
  };

  const isExpired = (lot: ChemicalLot) => {
    const actualExp = calculateActualExpiry(lot);
    return new Date(actualExp) < new Date();
  };

  const handleAmountChange = (lotId: string, value: string) => {
    setTransactionAmounts(prev => ({ ...prev, [lotId]: value }));
  };

  const handleDateChange = (lotId: string, value: string) => {
    setTransactionDates(prev => ({ ...prev, [lotId]: value }));
  };

  const getLotUsageHistory = (lotId: string) => {
    return auditLogs.filter(log => log.entityId === lotId && (
      log.action === 'LOT_USAGE' || 
      log.action === 'OPEN_LOT' || 
      log.action === 'LOT_STOCK_IN' || 
      log.action === 'ADD_LOT' ||
      log.action === 'CONSUME_ALL'
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, chemId: string, lotId: string, isOpened: boolean) => {
    if (!isOpened && e.key === 'Enter') return; 

    if (e.key === 'Enter') {
      const valStr = transactionAmounts[lotId];
      const dateStr = transactionDates[lotId] || todayStr;
      if (!valStr) return;
      const val = parseFloat(valStr);
      if (isNaN(val) || val === 0) return;
      
      if (val > 0) {
        onLotAction(chemId, lotId, 'USAGE', val, dateStr);
      } else {
        onLotAction(chemId, lotId, 'STOCK_IN', Math.abs(val), dateStr);
      }
      
      setTransactionAmounts(prev => ({ ...prev, [lotId]: '' }));
    }
    if (e.altKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      onLotAction(chemId, lotId, 'DISPOSE', undefined, transactionDates[lotId] || todayStr);
    }
    if (e.altKey && e.key.toLowerCase() === 'x') {
      e.preventDefault();
      onLotAction(chemId, lotId, 'CONSUME_ALL', undefined, transactionDates[lotId] || todayStr);
    }
  };

  return (
    <div className="space-y-4">
      {chemicals.map(chem => (
        <div key={chem.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:border-indigo-200">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              setExpandedChem(expandedChem === chem.id ? null : chem.id);
              setShowLotHistory(null);
            }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900 leading-tight">{chem.name}</span>
                <span className="text-xs text-gray-400 font-mono">{chem.formula} | CAS: {chem.casNumber}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm ${
                chem.state === PhysicalState.SOLID ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {chem.state}
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng tồn</p>
                <p className="font-black text-indigo-600 text-xl">
                  {chem.lots.reduce((acc, l) => acc + l.quantity, 0).toFixed(2)} <span className="text-xs text-gray-400 font-normal">{chem.lots[0]?.unit || ''}</span>
                </p>
              </div>
              <div className="transform scale-75 origin-right">
                <NFPADiamond rating={chem.nfpa} size="sm" />
              </div>
              <i className={`fas fa-chevron-${expandedChem === chem.id ? 'up' : 'down'} text-indigo-300 transition-transform`}></i>
            </div>
          </div>

          {expandedChem === chem.id && (
            <div className="bg-slate-50 border-t border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <i className="fas fa-boxes mr-2 text-indigo-400"></i>
                  Quản lý các số lô hàng
                </h3>
                <button 
                  onClick={() => onAddLot(chem.id)}
                  className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                >
                  <i className="fas fa-plus mr-1"></i> Nhập lô mới
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b">
                      <tr>
                        <th className="px-5 py-3">Số Lô NSX / Nội Bộ</th>
                        <th className="px-5 py-3">Tồn thực tế</th>
                        <th className="px-5 py-3 text-center">Các mốc thời gian</th>
                        <th className="px-5 py-3 text-center">Giao dịch nhanh</th>
                        <th className="px-5 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {chem.lots.map(lot => {
                        const expired = isExpired(lot);
                        const currentVal = transactionAmounts[lot.id] || '';
                        const currentDate = transactionDates[lot.id] || todayStr;
                        const isDisposalView = lot.status === 'EXPIRED' || lot.status === 'DISPOSED';
                        const isOpened = lot.status === 'IN_USE';
                        const history = getLotUsageHistory(lot.id);
                        const showingHistory = showLotHistory === lot.id;
                        
                        return (
                          <React.Fragment key={lot.id}>
                            <tr className={`${expired ? 'bg-red-50/70 animate-pulse' : 'hover:bg-slate-50/80'} transition-colors`}>
                              <td className="px-5 py-4">
                                <div className="font-bold text-slate-800 flex flex-col">
                                  <span className="text-indigo-600 text-[10px] font-black uppercase tracking-tighter mb-0.5">NSX: {lot.mfgLotNumber || 'N/A'}</span>
                                  <span className="flex items-center gap-2">
                                    {lot.lotNumber}
                                    {expired && <i className="fas fa-exclamation-triangle text-red-500 text-[10px]"></i>}
                                  </span>
                                </div>
                                <div className="mt-1 space-y-0.5">
                                  <div className="text-[10px] text-slate-400 font-mono uppercase">NHẬP: {lot.entryDate || 'N/A'}</div>
                                  {lot.lastUsedDate && (
                                    <div className="text-[10px] text-emerald-600 font-black uppercase"><i className="fas fa-history mr-1"></i>DÙNG GẦN NHẤT: {lot.lastUsedDate}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`font-mono font-black text-base ${expired ? 'text-red-700' : 'text-indigo-700'}`}>{lot.quantity.toFixed(2)}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">{lot.unit}</span>
                                </div>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                                  lot.status === 'IN_USE' ? 'bg-green-100 text-green-700' : 
                                  lot.status === 'EXPIRED' ? 'bg-red-600 text-white shadow-lg' :
                                  lot.status === 'DISPOSED' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {lot.status === 'RESERVED' ? 'Dự trữ (Chưa mở)' : lot.status === 'IN_USE' ? 'Đang dùng' : lot.status === 'EXPIRED' ? 'QUÁ HẠN' : lot.status === 'DISPOSED' ? 'Thanh lý' : 'Đã hết'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-center items-center gap-2">
                                     <span className="text-[9px] text-slate-400 font-bold uppercase w-12 text-right">Hết hạn:</span>
                                     <span className={`font-bold text-xs ${expired ? 'text-red-700' : 'text-slate-700'}`}>
                                        {calculateActualExpiry(lot)}
                                     </span>
                                  </div>
                                  {lot.openedDate && (
                                    <div className="flex justify-center items-center gap-2">
                                       <span className="text-[9px] text-indigo-400 font-bold uppercase w-12 text-right">Mở nắp:</span>
                                       <span className="font-bold text-[11px] text-indigo-600">{lot.openedDate}</span>
                                    </div>
                                  )}
                                  {expired && <span className="text-[9px] text-red-500 font-black italic">Nguy cơ biến chất!</span>}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                {!isDisposalView && (
                                  <div className="flex flex-col items-center">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <input 
                                          type="number" 
                                          value={currentVal}
                                          disabled={!isOpened}
                                          onChange={(e) => handleAmountChange(lot.id, e.target.value)}
                                          onKeyDown={(e) => handleKeyDown(e, chem.id, lot.id, isOpened)}
                                          placeholder={isOpened ? "Lượng..." : "Mở nắp..."}
                                          className={`w-24 text-xs border rounded-lg px-2 py-1.5 outline-none shadow-sm font-mono transition-all ${
                                            isOpened 
                                            ? 'border-slate-200 focus:ring-2 focus:ring-indigo-400 bg-white font-bold' 
                                            : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50'
                                          }`}
                                        />
                                        <button 
                                          onClick={() => {
                                            if (currentVal) {
                                              const val = parseFloat(currentVal);
                                              if (val > 0) onLotAction(chem.id, lot.id, 'USAGE', val, currentDate);
                                              else onLotAction(chem.id, lot.id, 'STOCK_IN', Math.abs(val), currentDate);
                                            }
                                            setTransactionAmounts(prev => ({ ...prev, [lot.id]: '' }));
                                          }}
                                          disabled={!isOpened || !currentVal}
                                          className={`text-[8px] px-2 py-1.5 rounded border font-black uppercase transition-all ${
                                            isOpened && currentVal
                                            ? 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700 shadow-sm'
                                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                          }`}
                                        >Dùng</button>
                                      </div>
                                      
                                      {/* Date Selection Row */}
                                      <div className={`flex items-center gap-1.5 transition-opacity ${isOpened ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]">
                                            <i className="fas fa-calendar-day"></i>
                                          </span>
                                          <input 
                                            type="date" 
                                            value={currentDate}
                                            disabled={!isOpened}
                                            onChange={(e) => handleDateChange(lot.id, e.target.value)}
                                            className="w-[124px] text-[10px] border-slate-200 border rounded-lg pl-6 pr-1 py-1 outline-none focus:ring-1 focus:ring-indigo-400 bg-white font-bold text-slate-600"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex flex-col gap-2 items-end">
                                  <div className="flex gap-2">
                                     <button 
                                      onClick={() => setShowLotHistory(showingHistory ? null : lot.id)}
                                      className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1.5 rounded-lg border transition-all ${
                                        showingHistory 
                                        ? 'bg-slate-800 text-white border-slate-900' 
                                        : 'text-slate-500 border-slate-200 hover:bg-slate-100'
                                      }`}
                                      title="Xem lịch sử sử dụng"
                                    >
                                      <i className="fas fa-history"></i>
                                    </button>
                                    {!lot.openedDate && !isDisposalView && (
                                      <button 
                                        onClick={() => onLotAction(chem.id, lot.id, 'OPEN', undefined, currentDate)} 
                                        className="text-[9px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 font-black shadow-lg shadow-emerald-100 transition-all uppercase flex items-center gap-1.5 animate-bounce-subtle"
                                      >
                                        <i className="fas fa-door-open"></i> Mở
                                      </button>
                                    )}
                                  </div>
                                  {!isDisposalView && (
                                    <button 
                                      onClick={() => onLotAction(chem.id, lot.id, 'DISPOSE', undefined, currentDate)}
                                      className={`text-[9px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg border transition-all ${
                                        expired 
                                        ? 'bg-red-700 text-white border-red-800 shadow-lg shadow-red-200 hover:bg-red-800' 
                                        : 'text-red-500 border-red-100 hover:bg-red-50'
                                      }`}
                                    >
                                      <i className={`fas ${expired ? 'fa-radiation-alt' : 'fa-trash-alt'} mr-1`}></i>
                                      {expired ? 'THANH LÝ' : 'Chờ TL'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            
                            {showingHistory && (
                              <tr>
                                <td colSpan={5} className="bg-indigo-50/30 px-5 py-4 animate-in slide-in-from-top-1">
                                  <div className="bg-white rounded-lg border border-indigo-100 shadow-inner overflow-hidden">
                                    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex justify-between items-center">
                                      <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fas fa-history"></i> Lịch sử lượng sử dụng lô {lot.lotNumber}
                                      </h4>
                                      <button onClick={() => setShowLotHistory(null)} className="text-indigo-400 hover:text-indigo-600"><i className="fas fa-times text-xs"></i></button>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto">
                                      <table className="w-full text-[10px]">
                                        <thead className="bg-slate-50 text-slate-400 font-black uppercase sticky top-0">
                                          <tr>
                                            <th className="px-4 py-2 text-left">Ngày</th>
                                            <th className="px-4 py-2 text-left">Hành động</th>
                                            <th className="px-4 py-2 text-right">Lượng</th>
                                            <th className="px-4 py-2 text-left">Người dùng</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {history.length === 0 ? (
                                            <tr>
                                              <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic font-bold">Chưa có bản ghi nào</td>
                                            </tr>
                                          ) : (
                                            history.map(log => (
                                              <tr key={log.id} className="hover:bg-indigo-50/20 transition-colors">
                                                <td className="px-4 py-2 whitespace-nowrap text-slate-500 font-mono">
                                                  {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </td>
                                                <td className="px-4 py-2">
                                                  <span className={`px-1.5 py-0.5 rounded-sm font-black tracking-tighter ${
                                                    log.action === 'LOT_USAGE' ? 'text-red-500' :
                                                    log.action === 'LOT_STOCK_IN' || log.action === 'ADD_LOT' ? 'text-emerald-500' : 'text-slate-500'
                                                  }`}>
                                                    {log.action === 'LOT_USAGE' ? 'XUẤT' : log.action === 'LOT_STOCK_IN' ? 'NHẬP THÊM' : log.action === 'ADD_LOT' ? 'KHỞI TẠO' : log.action}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-2 text-right font-black text-slate-700">
                                                  {log.amount ? `${log.action === 'LOT_USAGE' ? '-' : '+'}${log.amount} ${log.unit}` : '--'}
                                                </td>
                                                <td className="px-4 py-2 text-slate-500 font-bold">{log.userName}</td>
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-[11px]">
                <div className="text-slate-400 font-bold uppercase tracking-widest">
                  Vị trí: <span className="text-slate-700">{chem.location}</span> | NCC: <span className="text-slate-700">{chem.supplier}</span>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => onEdit(chem)} className="text-indigo-600 font-black hover:text-indigo-800 uppercase tracking-tighter">Sửa Master</button>
                   {userRole === UserRole.ADMIN && (
                     <button onClick={() => onDelete(chem.id)} className="text-red-500 font-black hover:text-red-700 uppercase tracking-tighter">Xóa hóa chất</button>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChemicalList;
