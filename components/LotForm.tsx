
import React, { useState } from 'react';
import { Chemical, ChemicalLot } from '../types';
import { UNITS } from '../constants';

interface LotFormProps {
  chemical: Chemical;
  onSave: (chemId: string, newLot: ChemicalLot) => void;
  onClose: () => void;
}

const LotForm: React.FC<LotFormProps> = ({ chemical, onSave, onClose }) => {
  const [showErrors, setShowErrors] = useState(false);
  const [lotData, setLotData] = useState<Partial<ChemicalLot>>({
    mfgLotNumber: '',
    lotNumber: '',
    quantity: 0,
    unit: chemical.lots[0]?.unit || UNITS[0],
    entryDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'RESERVED'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!lotData.lotNumber || !lotData.expiryDate) {
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
          <h3 className="text-lg font-black text-slate-800">Thêm lô hàng mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Hóa chất Master</p>
          <p className="font-bold text-indigo-900">{chemical.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Số lô NSX</label>
              <input 
                type="text" 
                required 
                autoFocus
                value={lotData.mfgLotNumber} 
                onChange={e => setLotData({...lotData, mfgLotNumber: e.target.value})} 
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Số lô gốc..."
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase ${showErrors && !lotData.lotNumber ? 'text-red-500' : 'text-slate-500'}`}>Số lô nội bộ *</label>
              <input 
                type="text" 
                required 
                value={lotData.lotNumber} 
                onChange={e => setLotData({...lotData, lotNumber: e.target.value})} 
                className={`mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${showErrors && !lotData.lotNumber ? 'border-red-500' : ''}`}
                placeholder="ID theo dõi..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Số lượng</label>
              <input 
                type="number" 
                required 
                value={lotData.quantity} 
                onChange={e => setLotData({...lotData, quantity: Number(e.target.value)})} 
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Đơn vị</label>
              <select 
                value={lotData.unit} 
                onChange={e => setLotData({...lotData, unit: e.target.value})} 
                className="mt-1 w-full border rounded-lg px-3 py-2 outline-none"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Ngày nhập kho</label>
            <input 
              type="date" 
              required
              value={lotData.entryDate} 
              onChange={e => setLotData({...lotData, entryDate: e.target.value})} 
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none text-sm"
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase ${showErrors && !lotData.expiryDate ? 'text-red-600' : 'text-slate-500'}`}>Ngày hết hạn *</label>
            <input 
              type="date" 
              required
              value={lotData.expiryDate} 
              onChange={e => setLotData({...lotData, expiryDate: e.target.value})} 
              className={`mt-1 w-full border rounded-lg px-3 py-2 outline-none text-sm ${showErrors && !lotData.expiryDate ? 'border-red-500 bg-red-50' : 'border-red-100'}`}
            />
            {showErrors && !lotData.expiryDate && (
              <p className="text-[10px] text-red-500 mt-1 font-black animate-pulse">
                <i className="fas fa-exclamation-circle mr-1"></i>
                YÊU CẦU: NHẬP NGÀY HẾT HẠN
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
            >Hủy</button>
            <button 
              type="submit" 
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >NHẬP KHO</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotForm;
