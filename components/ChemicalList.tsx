
import React, { useState } from 'react';
import { Chemical, UserRole, PhysicalState, ChemicalLot, AuditLog } from '../types';
import NFPADiamond from './NFPADiamond';

interface ChemicalListProps {
  chemicals: Chemical[];
  auditLogs: AuditLog[];
  userRole: UserRole;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onLotAction: (chemId: string, lotId: string, action: 'OPEN' | 'USAGE' | 'STOCK_IN' | 'DISPOSE' | 'CONSUME_ALL' | 'PRINT' | 'UPDATE_DATES', amount?: number, customDate?: string, extra?: any) => void;
  onAddLot: (chemId: string) => void;
}

const ChemicalList: React.FC<ChemicalListProps> = ({ chemicals, auditLogs, userRole, onEdit, onDelete, onLotAction, onAddLot }) => {
  const [expandedChem, setExpandedChem] = useState<string | null>(null);
  const [showLotHistory, setShowLotHistory] = useState<string | null>(null);
  const [transactionAmounts, setTransactionAmounts] = useState<{[key: string]: string}>({});
  const [transactionDates, setTransactionDates] = useState<{[key: string]: string}>({});
  const [transactionModes, setTransactionModes] = useState<{[key: string]: 'UNIT' | 'CONTAINER'}>({});

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date();

  const getPaoExpiry = (lot: ChemicalLot) => {
    if (!lot.openedDate || !lot.paoDays) return null;
    const opened = new Date(lot.openedDate);
    const paoExpiry = new Date(opened.getTime() + lot.paoDays * 24 * 60 * 60 * 1000);
    return paoExpiry;
  };

  const getEffectiveExpiry = (lot: ChemicalLot) => {
    const nsxExpiry = new Date(lot.expiryDate);
    const paoExpiry = getPaoExpiry(lot);
    
    if (!paoExpiry) return nsxExpiry;
    return paoExpiry < nsxExpiry ? paoExpiry : nsxExpiry;
  };

  const getExpiryStatus = (lot: ChemicalLot) => {
    const effective = getEffectiveExpiry(lot);
    const diffDays = Math.ceil((effective.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Hết hạn', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: 'fa-skull-crossbones' };
    if (diffDays <= 30) return { label: `Còn ${diffDays} ngày`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: 'fa-exclamation-triangle' };
    return { label: 'An toàn', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'fa-check-circle' };
  };

  const renderBottleIcons = (chem: Chemical, lot: ChemicalLot) => {
    if (!lot.containerCapacity || lot.containerCapacity <= 0) return null;
    
    const totalBottles = Math.ceil(lot.quantity / lot.containerCapacity);
    const partialAmount = lot.quantity % lot.containerCapacity;
    
    const icons = [];

    for (let i = 0; i < totalBottles; i++) {
      const isPartial = i === totalBottles - 1 && partialAmount > 0.01;
      const amount = isPartial ? partialAmount : lot.containerCapacity;
      const bottleOpenDate = lot.bottleOpeningDates?.[i] || '';
      
      let bottlePaoExp = '';
      if (bottleOpenDate) {
        const opened = new Date(bottleOpenDate);
        const exp = new Date(opened.getTime() + (chem.defaultPaoDays || 180) * 24 * 60 * 60 * 1000);
        bottlePaoExp = exp.toISOString().split('T')[0];
      }

      icons.push(
        <div key={`bottle-${i}`} className="flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-300 group min-w-[125px] animate-in fade-in zoom-in duration-300">
          <div className="relative mb-3 flex items-center justify-center">
            {isPartial ? (
               <div className="w-10 h-14 border-2 border-orange-200 rounded-md relative overflow-hidden bg-slate-50 shadow-inner">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-orange-400 opacity-90 transition-all duration-500" 
                    style={{ height: `${(partialAmount / lot.containerCapacity) * 100}%` }}
                  ></div>
               </div>
            ) : (
               <i className="fas fa-flask text-4xl text-indigo-500 drop-shadow-sm"></i>
            )}
          </div>
          <span className={`text-sm font-black mb-1 ${isPartial ? 'text-orange-600' : 'text-indigo-700'}`}>{amount.toFixed(0)}{lot.unit}</span>
          
          <div className="w-full pt-2 border-t border-slate-50 mt-2 space-y-1.5">
            <div className="text-center">
              <label className="block text-[8px] text-slate-400 font-black uppercase mb-0.5">Ngày mở</label>
              <input 
                type="date"
                value={bottleOpenDate}
                onChange={(e) => {
                  const newDates = { ...(lot.bottleOpeningDates || {}), [i]: e.target.value };
                  const extra: any = { bottleOpeningDates: newDates };
                  // Nếu là chai đầu tiên hoặc ngày mở sớm nhất, cập nhật openedDate chính của lô
                  if (!lot.openedDate || new Date(e.target.value) < new Date(lot.openedDate)) {
                      extra.openedDate = e.target.value;
                      extra.status = 'IN_USE';
                  }
                  onLotAction(chem.id, lot.id, 'UPDATE_DATES', undefined, undefined, extra);
                }}
                className="w-full text-[9px] font-black border-none bg-slate-50 rounded px-1 py-1 text-center focus:ring-1 focus:ring-indigo-300 cursor-pointer text-indigo-600 hover:bg-indigo-50 transition-all"
              />
            </div>
            
            <div className="text-center">
              <label className="block text-[8px] text-slate-400 font-black uppercase mb-0.5">Hạn dùng</label>
              <div className="w-full text-[9px] font-black text-indigo-500 bg-white py-0.5 rounded border border-indigo-50">
                {bottlePaoExp || '--'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-slate-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden shadow-inner">
        <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i className="fas fa-layer-group text-sm"></i>
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">Sơ đồ vật chứa (Chai/Lọ)</span>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-white px-5 py-2 rounded-full border border-indigo-100 shadow-sm">
              Tổng: {totalBottles} chai
            </span>
        </div>
        <div className="flex flex-wrap gap-5 mb-5">
          {icons}
        </div>
        
        <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-4 mt-2">
            <p className="text-[10px] font-black text-indigo-500 flex items-center gap-2 italic">
              <i className="fas fa-info-circle text-indigo-400"></i>
              Ưu tiên dùng chai mở nắp trước
            </p>
            <p className="text-[9px] font-bold text-slate-400 ml-5 italic">
              hạn dùng được tự động tính dựa trên ngày mở và thời gian PAO mặc định
            </p>
        </div>
      </div>
    );
  };

  const handleAmountChange = (lotId: string, value: string) => {
    setTransactionAmounts(prev => ({ ...prev, [lotId]: value }));
  };

  const executeTransaction = (chemId: string, lotId: string, lot: ChemicalLot) => {
    const valStr = transactionAmounts[lotId];
    if (!valStr || valStr === '') return;
    
    let val = parseFloat(valStr);
    const mode = transactionModes[lotId] || 'UNIT';
    const date = transactionDates[lotId] || todayStr;

    if (mode === 'CONTAINER') {
      val = val * (lot.containerCapacity || 1);
    }

    if (val > 0) {
      onLotAction(chemId, lotId, 'USAGE', val, date);
    } else if (val < 0) {
      onLotAction(chemId, lotId, 'STOCK_IN', Math.abs(val), date);
    }
    
    setTransactionAmounts(prev => ({ ...prev, [lotId]: '' }));
    setTransactionDates(prev => ({ ...prev, [lotId]: todayStr }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, chemId: string, lotId: string, lot: ChemicalLot) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeTransaction(chemId, lotId, lot);
    }
  };

  const getLotUsageHistory = (lotId: string) => {
    return auditLogs.filter(log => log.entityId === lotId && (
      log.action === 'LOT_USAGE' || 
      log.action === 'OPEN_LOT' || 
      log.action === 'LOT_STOCK_IN' || 
      log.action === 'ADD_LOT' ||
      log.action === 'CONSUME_ALL' ||
      log.action === 'UPDATE_DATES'
    ));
  };

  return (
    <div className="space-y-4 no-print">
      {chemicals.map(chem => {
        const totalQty = chem.lots.reduce((acc, l) => acc + l.quantity, 0);
        const lowStock = totalQty < (chem.minThreshold || 0);
        
        const hasExpiredLot = chem.lots.some(l => {
          const eff = getEffectiveExpiry(l);
          return eff < today;
        });

        return (
          <div key={chem.id} className={`bg-white rounded-[2.5rem] shadow-sm border transition-all hover:shadow-xl ${hasExpiredLot ? 'border-red-200 ring-2 ring-red-50' : lowStock ? 'border-orange-200 ring-2 ring-orange-50' : 'border-gray-100'}`}>
            <div 
              className="p-7 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedChem(expandedChem === chem.id ? null : chem.id)}
            >
              <div className="flex items-center space-x-7">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${hasExpiredLot ? 'bg-red-100 text-red-600' : lowStock ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                   <i className={`fas ${hasExpiredLot ? 'fa-radiation' : 'fa-flask'}`}></i>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl text-slate-800 flex items-center gap-3">
                    {chem.name}
                    {hasExpiredLot && <span className="bg-red-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider">Hết hạn</span>}
                    {lowStock && !hasExpiredLot && <span className="bg-orange-500 text-white text-[9px] px-3 py-1 rounded-full font-black animate-pulse uppercase tracking-wider">Sắp hết hàng</span>}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mt-1">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{chem.formula}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>CAS: {chem.casNumber}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-indigo-500 font-black">{chem.supplier}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-12">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tồn kho hiện tại</p>
                  <p className={`font-black text-3xl tracking-tighter ${hasExpiredLot ? 'text-red-600' : lowStock ? 'text-orange-600' : 'text-indigo-600'}`}>
                    {totalQty.toFixed(1)} <span className="text-base font-bold text-slate-400">{chem.lots[0]?.unit || ''}</span>
                  </p>
                </div>
                <div className="transform scale-90">
                  <NFPADiamond rating={chem.nfpa} size="sm" />
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${expandedChem === chem.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300'}`}>
                  <i className={`fas fa-chevron-${expandedChem === chem.id ? 'up' : 'down'} text-sm`}></i>
                </div>
              </div>
            </div>

            {expandedChem === chem.id && (
              <div className="bg-white border-t p-8 rounded-b-[2.5rem] space-y-8 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                    Quản lý Lô & Hạn dùng PAO
                  </h3>
                  <div className="flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(chem); }} className="text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 px-5 py-2.5 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-100 transition-all shadow-sm">
                      Cập nhật Master
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAddLot(chem.id); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                      Nhập lô mới
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {chem.lots.map(lot => {
                    const expiryStatus = getExpiryStatus(lot);
                    const effExpiry = getEffectiveExpiry(lot);
                    const paoExp = getPaoExpiry(lot);
                    const mode = transactionModes[lot.id] || 'UNIT';
                    const showingHistory = showLotHistory === lot.id;
                    const isUrgent = effExpiry < today || Math.ceil((effExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 30;
                    
                    return (
                      <div key={lot.id} className={`bg-white rounded-[2.5rem] border-2 p-10 flex flex-col lg:flex-row gap-10 shadow-sm transition-all hover:border-indigo-200 ${effExpiry < today ? 'border-red-200 bg-red-50/5' : isUrgent ? 'border-orange-200' : 'border-slate-100'}`}>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-8">
                            <div className="space-y-2">
                               <div className="flex items-center gap-3">
                                  <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-5 py-2 rounded-full uppercase border border-indigo-100 shadow-sm">Lô: {lot.lotNumber}</span>
                                  {lot.status === 'IN_USE' && <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-5 py-2 rounded-full uppercase border border-orange-100 shadow-sm">Đang mở nắp</span>}
                               </div>
                               <h4 className="font-black text-slate-800 text-xl mt-3">Số lô NSX: {lot.mfgLotNumber}</h4>
                            </div>
                            <div className={`text-right px-8 py-5 rounded-[2rem] border-2 ${expiryStatus.border} ${expiryStatus.bg} shadow-sm`}>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hạn dùng thực tế</p>
                               <p className={`text-xl font-black ${expiryStatus.color} flex items-center justify-end gap-3`}>
                                  <i className={`fas ${expiryStatus.icon}`}></i>
                                  {effExpiry.toISOString().split('T')[0]}
                                </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8 mb-8">
                             <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạn Nhà sản xuất</p>
                                <p className="text-sm font-bold text-slate-700 mt-2">{lot.expiryDate}</p>
                             </div>
                             <div className={`p-6 rounded-2xl border ${lot.openedDate ? 'bg-orange-50/50 border-orange-200 shadow-inner' : 'bg-slate-50/50 border-slate-100'}`}>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạn PAO ({chem.defaultPaoDays} ngày)</p>
                                <div className="flex items-center gap-3 mt-2">
                                   <p className={`text-sm font-black uppercase ${lot.openedDate ? 'text-orange-700' : 'text-orange-400 animate-pulse'}`}>
                                      {lot.openedDate ? (paoExp?.toISOString().split('T')[0]) : 'Chưa bóc tem'}
                                   </p>
                                </div>
                             </div>
                          </div>
                          
                          {renderBottleIcons(chem, lot)}
                          
                          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-5 text-[11px] font-black text-slate-400 border-t border-slate-100 pt-7">
                             <div className="flex items-center gap-3 group">
                                <span className="uppercase tracking-[0.2em] text-slate-300">Nhập:</span>
                                <input 
                                  type="date"
                                  value={lot.entryDate}
                                  onChange={(e) => onLotAction(chem.id, lot.id, 'UPDATE_DATES', undefined, undefined, { entryDate: e.target.value })}
                                  className="border-none bg-slate-50 px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 focus:ring-1 focus:ring-indigo-300 font-black cursor-pointer transition-all shadow-sm"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="uppercase tracking-[0.2em] text-orange-400">Bóc tem:</span>
                                <input 
                                  type="date"
                                  value={lot.openedDate || todayStr}
                                  onChange={(e) => onLotAction(chem.id, lot.id, 'UPDATE_DATES', undefined, undefined, { openedDate: e.target.value, status: 'IN_USE' })}
                                  className="border-none bg-orange-50 px-4 py-2 rounded-xl text-orange-600 hover:text-orange-700 focus:ring-1 focus:ring-orange-300 font-black cursor-pointer transition-all shadow-sm"
                                />
                             </div>
                             <button onClick={() => setShowLotHistory(showingHistory ? null : lot.id)} className="ml-auto text-indigo-500 hover:text-indigo-700 flex items-center gap-3 font-black uppercase tracking-widest text-[11px] transition-colors">
                               <i className="fas fa-history text-lg"></i> Nhật ký
                             </button>
                          </div>
                        </div>

                        <div className="w-full lg:w-96 bg-slate-50/30 rounded-[3.5rem] p-10 border-2 border-slate-100 flex flex-col justify-between shadow-inner">
                           <div className="space-y-10">
                              <div className="flex justify-between items-center">
                                 <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Giao dịch nhanh</span>
                                 <div className="flex bg-white rounded-2xl p-2 border-2 border-slate-100 shadow-sm">
                                    <button onClick={() => setTransactionModes(p => ({...p, [lot.id]: 'UNIT'}))} className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all ${mode === 'UNIT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}>{lot.unit.toUpperCase()}</button>
                                    <button onClick={() => setTransactionModes(p => ({...p, [lot.id]: 'CONTAINER'}))} className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all ${mode === 'CONTAINER' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}>{lot.packaging.toUpperCase()}</button>
                                 </div>
                              </div>

                              <div className="flex gap-4">
                                 <input 
                                    type="number"
                                    placeholder="Lượng dùng..."
                                    value={transactionAmounts[lot.id] || ''}
                                    onChange={(e) => handleAmountChange(lot.id, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, chem.id, lot.id, lot)}
                                    className="flex-1 bg-white border-2 border-slate-100 rounded-[1.5rem] px-7 py-5 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                                 />
                                 <button onClick={() => executeTransaction(chem.id, lot.id, lot)} className="bg-slate-900 text-white px-8 rounded-[1.5rem] hover:bg-black transition-all shadow-xl active:scale-90 flex items-center justify-center">
                                    <i className="fas fa-check text-xl"></i>
                                 </button>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                 <button 
                                    onClick={() => onLotAction(chem.id, lot.id, 'USAGE', lot.containerCapacity, todayStr)}
                                    className="bg-white border-2 border-orange-200 text-orange-700 py-5 rounded-[1.5rem] text-[12px] font-black uppercase hover:bg-orange-50 shadow-sm transition-all active:scale-[0.98]"
                                 >XUẤT 1 {lot.packaging.toUpperCase()}</button>
                                 <button onClick={() => onLotAction(chem.id, lot.id, 'PRINT')} className="bg-white border-2 border-slate-200 text-slate-500 py-5 rounded-[1.5rem] text-[12px] font-black uppercase hover:bg-slate-100 shadow-sm transition-all">
                                   <i className="fas fa-print mr-2"></i> IN NHÃN MÃ VẠCH
                                 </button>
                              </div>
                           </div>
                           
                           {isUrgent && (
                              <button 
                                 onClick={() => onLotAction(chem.id, lot.id, 'DISPOSE')}
                                 className="w-full mt-12 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-[1.5rem] text-[12px] font-black uppercase shadow-2xl shadow-red-200 hover:from-red-700 hover:to-red-800 animate-pulse transition-all active:scale-95 flex items-center justify-center gap-4"
                              >
                                 <i className="fas fa-trash-alt text-lg"></i> KHAI BÁO THANH LÝ NGAY
                              </button>
                           )}
                        </div>
                      </div>
                    );
                  })}
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
