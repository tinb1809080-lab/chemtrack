
import React, { useState } from 'react';
import { Chemical, UserRole, PhysicalState, ChemicalLot, AuditLog } from '../types';
import NFPADiamond from './NFPADiamond';

interface ChemicalListProps {
  chemicals: Chemical[];
  auditLogs: AuditLog[];
  userRole: UserRole;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onLotAction: (chemId: string, lotId: string, action: 'OPEN' | 'USAGE' | 'STOCK_IN' | 'DISPOSE' | 'CONSUME_ALL' | 'PRINT', amount?: number, customDate?: string) => void;
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

  const isLowStock = (chem: Chemical) => {
    const totalQty = chem.lots
      .filter(l => l.status === 'RESERVED' || l.status === 'IN_USE')
      .reduce((acc, l) => acc + l.quantity, 0);
    return totalQty > 0 && totalQty < (chem.minThreshold || 0);
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

  return (
    <div className="space-y-4 no-print">
      {chemicals.map(chem => {
        const lowStock = isLowStock(chem);
        return (
          <div key={chem.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:border-indigo-200 ${lowStock ? 'border-orange-200 ring-2 ring-orange-50' : 'border-gray-100'}`}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                setExpandedChem(expandedChem === chem.id ? null : chem.id);
                setShowLotHistory(null);
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-gray-900 leading-tight flex items-center gap-2">
                    {chem.name}
                    {lowStock && (
                      <span className="bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1">
                        <i className="fas fa-exclamation-circle"></i> SẮP HẾT
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{chem.formula} | CAS: {chem.casNumber}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng tồn</p>
                  <p className={`font-black text-xl ${lowStock ? 'text-orange-600' : 'text-indigo-600'}`}>
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <i className="fas fa-boxes mr-2 text-indigo-400"></i> Danh sách lô hàng
                  </h3>
                  <button onClick={() => onAddLot(chem.id)} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100">
                    <i className="fas fa-plus mr-1"></i> Nhập lô mới
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b">
                      <tr>
                        <th className="px-5 py-3">Số Lô</th>
                        <th className="px-5 py-3">Số lượng</th>
                        <th className="px-5 py-3 text-center">Giao dịch</th>
                        <th className="px-5 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {chem.lots.map(lot => {
                        const expired = isExpired(lot);
                        const showingHistory = showLotHistory === lot.id;
                        const history = getLotUsageHistory(lot.id);
                        
                        return (
                          <React.Fragment key={lot.id}>
                            <tr className={expired ? 'bg-red-50/50' : ''}>
                              <td className="px-5 py-4">
                                <div className="font-bold text-slate-800 flex flex-col">
                                  <span className="text-indigo-600 text-[9px] font-black uppercase">NSX: {lot.mfgLotNumber}</span>
                                  <span>{lot.lotNumber}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`font-mono font-black ${expired ? 'text-red-700' : 'text-indigo-700'}`}>{lot.quantity.toFixed(2)} {lot.unit}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center gap-1 justify-center">
                                  <input 
                                    type="number" 
                                    className="w-16 text-xs border rounded p-1" 
                                    placeholder="+/-" 
                                    onChange={(e) => handleAmountChange(lot.id, e.target.value)}
                                    value={transactionAmounts[lot.id] || ''}
                                  />
                                  <button 
                                    onClick={() => {
                                      const val = parseFloat(transactionAmounts[lot.id]);
                                      if (val > 0) onLotAction(chem.id, lot.id, 'USAGE', val);
                                      else onLotAction(chem.id, lot.id, 'STOCK_IN', Math.abs(val));
                                      setTransactionAmounts(prev => ({ ...prev, [lot.id]: '' }));
                                    }}
                                    className="bg-indigo-600 text-white p-1 rounded text-[10px]"
                                  ><i className="fas fa-check"></i></button>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right flex gap-1 justify-end">
                                <button onClick={() => onLotAction(chem.id, lot.id, 'PRINT')} className="text-slate-400 hover:text-indigo-600 p-2" title="In nhãn">
                                  <i className="fas fa-print"></i>
                                </button>
                                <button onClick={() => setShowLotHistory(showingHistory ? null : lot.id)} className="text-slate-400 hover:text-indigo-600 p-2" title="Lịch sử">
                                  <i className="fas fa-history"></i>
                                </button>
                                {!lot.openedDate && (
                                  <button onClick={() => onLotAction(chem.id, lot.id, 'OPEN')} className="bg-emerald-600 text-white px-2 py-1 rounded text-[9px] font-black uppercase">Mở nắp</button>
                                )}
                              </td>
                            </tr>
                            {showingHistory && (
                              <tr className="bg-indigo-50/30">
                                <td colSpan={4} className="p-4">
                                  <div className="space-y-1">
                                    {history.map(log => (
                                      <div key={log.id} className="text-[10px] flex justify-between border-b border-white py-1">
                                        <span className="text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                                        <span className="font-bold">{log.details}</span>
                                        <span className="font-black text-indigo-600">{log.amount} {log.unit}</span>
                                      </div>
                                    ))}
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChemicalList;
