
import React, { useState, useEffect } from 'react';
import { Chemical, ChemicalLot } from '../types';
import { UNIT_GROUPS } from '../constants';

interface LotFormProps {
  chemical: Chemical;
  onSave: (chemId: string, lot: ChemicalLot) => void;
  onClose: () => void;
}

const LotForm: React.FC<LotFormProps> = ({ chemical, onSave, onClose }) => {
  const [showErrors, setShowErrors] = useState(false);
  const [containerCount, setContainerCount] = useState<number>(1);
  const [lotData, setLotData] = useState<Partial<ChemicalLot>>({
    mfgLotNumber: '',
    lotNumber: '',
    packaging: chemical.lots[0]?.packaging || UNIT_GROUPS.PACKAGING[0],
    containerCapacity: chemical.lots[0]?.containerCapacity || 0,
    quantity: 0,
    unit: chemical.lots[0]?.unit || UNIT_GROUPS.MEASUREMENT[0],
    entryDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'RESERVED'
  });

  useEffect(() => {
    setLotData(prev => ({
      ...prev,
      quantity: containerCount * (prev.containerCapacity || 0)
    }));
  }, [containerCount, lotData.containerCapacity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!lotData.lotNumber || !lotData.expiryDate || !lotData.containerCapacity || !lotData.entryDate) {
      return;
    }

    const newLot: ChemicalLot = {
      ...lotData,
      id: `lot-${Math.random().toString(36).substr(2, 5)}`,
    } as ChemicalLot;

    onSave(chemical.id, newLot);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-800">Nhập lô hàng lẻ mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex justify-between">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Hóa chất Master</p>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{chemical.supplier}</p>
          </div>
          <p className="font-bold text-indigo-900">{chemical.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Số lô nhà sản xuất</label>
            <input 
              type="text" 
              value={lotData.mfgLotNumber} 
              onChange={e => setLotData({...lotData, mfgLotNumber: e.target.value})} 
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold bg-slate-50"
              placeholder="Số lô gốc của NSX..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">ID Lô nội bộ *</label>
              <input 
                type="text" 
                required 
                autoFocus
                value={lotData.lotNumber} 
                onChange={e => setLotData({...lotData, lotNumber: e.target.value})} 
                className={`mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold ${showErrors && !lotData.lotNumber ? 'border-red-500' : ''}`}
                placeholder="ID theo dõi..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Quy cách vỏ</label>
              <select 
                value={lotData.packaging} 
                onChange={e => setLotData({...lotData, packaging: e.target.value})} 
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none font-bold text-xs"
              >
                {UNIT_GROUPS.PACKAGING.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-inner">
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-[9px] font-black text-indigo-500 uppercase">Số {lotData.packaging}</label>
                <input 
                  type="number" 
                  value={containerCount} 
                  onChange={e => setContainerCount(Number(e.target.value))} 
                  className="w-full border rounded-lg px-3 py-2 bg-white outline-none font-black text-indigo-700"
                />
              </div>
              <div className="flex h-10 items-center justify-center text-slate-300">
                <i className="fas fa-times"></i>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end mt-3">
              <div>
                <label className="block text-[9px] font-black text-indigo-500 uppercase">Dung tích/{lotData.packaging}</label>
                <input 
                  type="number" 
                  required
                  value={lotData.containerCapacity} 
                  onChange={e => setLotData({...lotData, containerCapacity: Number(e.target.value)})} 
                  className="w-full border rounded-lg px-3 py-2 bg-white outline-none font-bold"
                />
              </div>
              <div>
                <select 
                  value={lotData.unit} 
                  onChange={e => setLotData({...lotData, unit: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 bg-white outline-none font-bold text-xs"
                >
                  {UNIT_GROUPS.MEASUREMENT.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center text-[10px] font-black text-indigo-400">
              <span>TỔNG NHẬP:</span>
              <span className="text-sm text-indigo-700">{lotData.quantity?.toFixed(1)} {lotData.unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-tighter ${showErrors && !lotData.entryDate ? 'text-red-600' : 'text-slate-500'}`}>Ngày nhận kho *</label>
              <input 
                type="date" 
                required
                value={lotData.entryDate} 
                onChange={e => setLotData({...lotData, entryDate: e.target.value})} 
                className={`mt-1 w-full border rounded-lg px-3 py-2 outline-none text-xs font-bold ${showErrors && !lotData.entryDate ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-tighter ${showErrors && !lotData.expiryDate ? 'text-red-600' : 'text-slate-500'}`}>Ngày hết hạn *</label>
              <input 
                type="date" 
                required
                value={lotData.expiryDate} 
                onChange={e => setLotData({...lotData, expiryDate: e.target.value})} 
                className={`mt-1 w-full border rounded-lg px-3 py-2 outline-none text-xs font-bold ${showErrors && !lotData.expiryDate ? 'border-red-500 bg-red-50' : 'border-indigo-100'}`}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
            >Hủy</button>
            <button 
              type="submit" 
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest"
            >Xác nhận</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotForm;
