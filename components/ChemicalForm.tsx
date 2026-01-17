
import React, { useState, useEffect } from 'react';
import { Chemical, PhysicalState, NFPARating, ChemicalLot } from '../types';
import { CATEGORIES, UNIT_GROUPS } from '../constants';
import { MASTER_CHEMICAL_NAMES, CHEMICAL_CATALOG } from '../services/chemicalCatalog';

interface ChemicalFormProps {
  chemical?: Chemical;
  initialStatus?: ChemicalLot['status'];
  onSave: (chemical: Chemical) => void;
  onClose: () => void;
}

const ChemicalForm: React.FC<ChemicalFormProps> = ({ chemical, initialStatus = 'RESERVED', onSave, onClose }) => {
  const [showErrors, setShowErrors] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Chemical>>(chemical || {
    code: `CH-${Math.floor(Math.random() * 900) + 100}`,
    name: '',
    formula: '',
    casNumber: '',
    category: CATEGORIES[0],
    state: PhysicalState.LIQUID,
    hazardGHS: [],
    nfpa: { health: 0, flammability: 0, instability: 0 },
    lots: [],
    location: '',
    supplier: '',
    defaultPaoDays: 180,
    minThreshold: 5,
  });

  const [lotData, setLotData] = useState<Partial<ChemicalLot>>(
    chemical && chemical.lots && chemical.lots.length > 0 
    ? { ...chemical.lots[0] } 
    : {
        mfgLotNumber: '',
        lotNumber: '',
        packaging: UNIT_GROUPS.PACKAGING[0],
        containerCapacity: 0,
        quantity: 0,
        unit: UNIT_GROUPS.MEASUREMENT[0],
        entryDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        status: initialStatus
      }
  );

  const [containerCount, setContainerCount] = useState<number>(
    chemical && chemical.lots && chemical.lots.length > 0 
    ? chemical.lots[0].quantity / (chemical.lots[0].containerCapacity || 1)
    : 1
  );

  useEffect(() => {
    if (lotData.containerCapacity && containerCount) {
      setLotData(prev => ({
        ...prev,
        quantity: containerCount * (prev.containerCapacity || 0)
      }));
    }
  }, [containerCount, lotData.containerCapacity]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({ ...prev, name: newName }));

    const catalogMatch = CHEMICAL_CATALOG[newName];
    if (catalogMatch) {
      setFormData(prev => ({
        ...prev,
        formula: catalogMatch.formula,
        casNumber: catalogMatch.casNumber,
        state: catalogMatch.state,
        category: catalogMatch.category,
        location: catalogMatch.location,
        nfpa: { ...catalogMatch.nfpa }
      }));
      
      if (catalogMatch.packaging) {
        const capMatch = catalogMatch.packaging.match(/(\d+(\.\d+)?)/);
        if (capMatch) {
          setLotData(prev => ({
            ...prev,
            containerCapacity: parseFloat(capMatch[0])
          }));
        }
      }

      setIsAutoFilled(true);
      setTimeout(() => setIsAutoFilled(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!lotData.lotNumber || !lotData.expiryDate || !lotData.containerCapacity || !lotData.entryDate) {
      return; 
    }
    
    const finalChemical = { ...formData } as Chemical;
    const updatedLot = {
      ...lotData,
      id: lotData.id || `lot-${Math.random().toString(36).substr(2, 5)}`,
    } as ChemicalLot;

    if (chemical && chemical.lots && chemical.lots.length > 0) {
      finalChemical.lots = chemical.lots.map((l, idx) => idx === 0 ? updatedLot : l);
    } else {
      finalChemical.lots = [updatedLot];
    }
    
    onSave(finalChemical);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-8 relative animate-in zoom-in duration-200 my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
        
        <div className="mb-8 border-b pb-4">
          <h2 className="text-2xl font-black text-indigo-700 flex items-center gap-3">
            <i className={`fas ${chemical ? 'fa-edit' : 'fa-flask'}`}></i>
            {chemical ? 'Chỉnh sửa Hóa chất' : initialStatus === 'DISPOSED' ? 'Khai báo Hóa chất Thanh lý' : 'Nhập kho Hóa chất Mới'}
          </h2>
          <p className="text-sm text-slate-400 font-medium">Quản lý thông tin nguồn gốc và hạn dùng của vật chứa.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* PHẦN 1: THÔNG TIN MASTER */}
              <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                {isAutoFilled && (
                  <div className="absolute top-2 right-4 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase animate-bounce">
                    <i className="fas fa-magic mr-1"></i> Đã điền tự động
                  </div>
                )}
                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <i className="fas fa-id-card"></i> THÔNG TIN ĐỊNH DANH & NHÀ SX
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tên hóa chất</label>
                    <input 
                      list="master-chemical-list"
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={handleNameChange} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold shadow-inner"
                      placeholder="Chọn hoặc nhập tên hóa chất..."
                    />
                    <datalist id="master-chemical-list">
                      {MASTER_CHEMICAL_NAMES.map((name, idx) => (
                        <option key={idx} value={name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Công thức hóa học</label>
                    <input 
                      type="text" 
                      value={formData.formula} 
                      onChange={e => setFormData({...formData, formula: e.target.value})} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none font-mono shadow-inner text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số CAS</label>
                    <input 
                      type="text" 
                      value={formData.casNumber} 
                      onChange={e => setFormData({...formData, casNumber: e.target.value})} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none shadow-inner text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nhà sản xuất / Thương hiệu</label>
                    <input 
                      type="text" 
                      value={formData.supplier} 
                      onChange={e => setFormData({...formData, supplier: e.target.value})} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner font-bold text-indigo-800" 
                      placeholder="VD: Merck, Sigma, Fisher..."
                    />
                  </div>
                </div>
              </section>

              {/* PHẦN 2: CÀI ĐẶT LƯU TRỮ */}
              <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <i className="fas fa-warehouse"></i> CẢNH BÁO & LƯU TRỮ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                    <label className="block text-[10px] font-black text-amber-600 uppercase mb-1">Ngưỡng tồn kho tối thiểu</label>
                    <input 
                      type="number" 
                      required
                      value={formData.minThreshold} 
                      onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} 
                      className="w-full border border-amber-200 rounded-lg px-3 py-2 bg-white font-black text-amber-700 outline-none shadow-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <label className="block text-[10px] font-black text-indigo-600 uppercase mb-1">Hạn dùng sau mở nắp (Ngày)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.defaultPaoDays} 
                      onChange={e => setFormData({...formData, defaultPaoDays: Number(e.target.value)})} 
                      className="w-full border border-indigo-200 rounded-lg px-3 py-2 bg-white font-black text-indigo-700 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Danh mục</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none shadow-inner font-bold text-indigo-700">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vị trí lưu trữ chi tiết</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner font-bold text-indigo-800" 
                      placeholder="Tủ A, Kệ 1..."
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {/* PHẦN 3: CHI TIẾT LÔ HÀNG */}
              <section className={`${initialStatus === 'DISPOSED' ? 'bg-red-50/50 border-red-100' : 'bg-indigo-50/50 border-indigo-200'} p-6 rounded-xl border shadow-sm`}>
                <h3 className={`text-xs font-black ${initialStatus === 'DISPOSED' ? 'text-red-500' : 'text-indigo-500'} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                   <i className="fas fa-boxes"></i> THÔNG SỐ LÔ & HẠN DÙNG
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Số lô nhà sản xuất</label>
                    <input 
                      type="text" 
                      value={lotData.mfgLotNumber} 
                      onChange={e => setLotData({...lotData, mfgLotNumber: e.target.value})} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none shadow-inner text-sm font-bold text-slate-700" 
                      placeholder="Số lô gốc..."
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${showErrors && !lotData.lotNumber ? 'text-red-600' : 'text-slate-500'}`}>Số lô nội bộ *</label>
                    <input 
                      type="text" 
                      required 
                      value={lotData.lotNumber} 
                      onChange={e => setLotData({...lotData, lotNumber: e.target.value})} 
                      className={`w-full border rounded-lg px-3 py-2 bg-white outline-none shadow-inner text-sm font-bold ${showErrors && !lotData.lotNumber ? 'border-red-500' : 'border-slate-200'}`} 
                      placeholder="ID định danh kho..."
                    />
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-200/50 shadow-inner space-y-4">
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-indigo-500 tracking-wider mb-1">Số lượng</label>
                        <input 
                          type="number" 
                          value={containerCount} 
                          onChange={e => setContainerCount(Number(e.target.value))} 
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 outline-none font-black text-indigo-800"
                        />
                      </div>
                      <div>
                        <select 
                          value={lotData.packaging} 
                          onChange={e => setLotData({...lotData, packaging: e.target.value})} 
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none shadow-inner text-xs font-bold"
                        >
                          {UNIT_GROUPS.PACKAGING.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-indigo-500 tracking-wider mb-1">Dung tích/{lotData.packaging}</label>
                        <input 
                          type="number" 
                          required
                          value={lotData.containerCapacity} 
                          onChange={e => setLotData({...lotData, containerCapacity: Number(e.target.value)})} 
                          className={`w-full border rounded-lg px-3 py-2 bg-white outline-none font-black ${showErrors && !lotData.containerCapacity ? 'border-red-500' : 'border-slate-200'}`}
                        />
                      </div>
                      <div>
                        <select 
                          value={lotData.unit} 
                          onChange={e => setLotData({...lotData, unit: e.target.value})} 
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none font-bold text-xs"
                        >
                          {UNIT_GROUPS.MEASUREMENT.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">TỔNG: </span>
                       <span className="text-sm font-black text-indigo-600">{lotData.quantity?.toFixed(2)} {lotData.unit}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${showErrors && !lotData.entryDate ? 'text-red-600' : 'text-slate-500'}`}>Ngày nhận *</label>
                      <input 
                        type="date" 
                        required
                        value={lotData.entryDate} 
                        onChange={e => setLotData({...lotData, entryDate: e.target.value})} 
                        className={`w-full border rounded-lg px-3 py-2 bg-white outline-none text-xs shadow-inner font-bold ${showErrors && !lotData.entryDate ? 'border-red-500' : 'border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${showErrors && !lotData.expiryDate ? 'text-red-600' : 'text-slate-500'}`}>Hết hạn *</label>
                      <input 
                        type="date" 
                        required
                        value={lotData.expiryDate} 
                        onChange={e => setLotData({...lotData, expiryDate: e.target.value})} 
                        className={`w-full border rounded-lg px-3 py-2 bg-white outline-none text-xs shadow-inner font-bold ${showErrors && !lotData.expiryDate ? 'border-red-500' : 'border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>
              </section>
              
              <section className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 shadow-sm">
                <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4">NFPA 704</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <label className="block text-[9px] font-black text-blue-600 uppercase">Y tế</label>
                    <input type="number" max="4" min="0" value={formData.nfpa?.health} onChange={e => setFormData({...formData, nfpa: {...formData.nfpa!, health: Number(e.target.value)}})} className="w-full bg-transparent border-none text-center font-black text-blue-800 text-lg outline-none"/>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                    <label className="block text-[9px] font-black text-red-600 uppercase">Cháy</label>
                    <input type="number" max="4" min="0" value={formData.nfpa?.flammability} onChange={e => setFormData({...formData, nfpa: {...formData.nfpa!, flammability: Number(e.target.value)}})} className="w-full bg-transparent border-none text-center font-black text-red-800 text-lg outline-none"/>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-8 py-2.5 border border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-all">Hủy bỏ</button>
            <button type="submit" className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all uppercase tracking-widest text-xs">
              {chemical ? 'Cập nhật hệ thống' : 'Xác nhận nhập kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChemicalForm;
