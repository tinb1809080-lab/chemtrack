
import React, { useState, useEffect } from 'react';
import { Chemical, PhysicalState, NFPARating, ChemicalLot } from '../types';
import { CATEGORIES, UNITS } from '../constants';
import { searchChemicalInfo } from '../services/geminiService';
import { MASTER_CHEMICAL_NAMES } from '../services/chemicalCatalog';

interface ChemicalFormProps {
  chemical?: Chemical;
  initialStatus?: ChemicalLot['status'];
  onSave: (chemical: Chemical) => void;
  onClose: () => void;
}

const ChemicalForm: React.FC<ChemicalFormProps> = ({ chemical, initialStatus = 'RESERVED', onSave, onClose }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [sources, setSources] = useState<{uri: string, title: string}[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  
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
    minThreshold: 10,
  });

  const [lotData, setLotData] = useState<Partial<ChemicalLot>>(
    chemical && chemical.lots && chemical.lots.length > 0 
    ? { ...chemical.lots[0] } 
    : {
        mfgLotNumber: '',
        lotNumber: '',
        quantity: 0,
        unit: UNITS[0],
        entryDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        status: initialStatus
      }
  );

  useEffect(() => {
    if (!chemical) {
      setLotData(prev => ({ ...prev, status: initialStatus }));
    }
  }, [initialStatus, chemical]);

  const handleAISuggest = async () => {
    if (!formData.name || formData.name.length < 2) {
      alert("Vui lòng nhập tên hóa chất để tìm kiếm!");
      return;
    }
    
    setLoadingAI(true);
    const result = await searchChemicalInfo(formData.name);
    
    if (result.data) {
      setFormData(prev => ({
        ...prev,
        name: result.data.name || prev.name,
        formula: result.data.formula || prev.formula,
        casNumber: result.data.casNumber || prev.casNumber,
        category: CATEGORIES.includes(result.data.category) ? result.data.category : prev.category,
        state: Object.values(PhysicalState).includes(result.data.state as PhysicalState) ? result.data.state as PhysicalState : prev.state,
        nfpa: result.data.nfpa ? {
          health: result.data.nfpa.health ?? prev.nfpa?.health ?? 0,
          flammability: result.data.nfpa.flammability ?? prev.nfpa?.flammability ?? 0,
          instability: result.data.nfpa.instability ?? prev.nfpa?.instability ?? 0,
          special: result.data.nfpa.special ?? prev.nfpa?.special ?? ""
        } : prev.nfpa
      }));
      setSources(result.sources);
    } else {
      alert("Không tìm thấy thông tin tự động cho hóa chất này.");
    }
    setLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!lotData.lotNumber || !lotData.expiryDate) {
      return; 
    }
    
    const finalChemical = { ...formData } as Chemical;
    const updatedLot = {
      ...lotData,
      id: lotData.id || `lot-${Math.random().toString(36).substr(2, 5)}`,
    } as ChemicalLot;

    if (chemical && chemical.lots && chemical.lots.length > 0) {
      finalChemical.lots = [updatedLot, ...chemical.lots.slice(1)];
    } else {
      finalChemical.lots = [updatedLot];
    }
    
    onSave(finalChemical);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative animate-in zoom-in duration-200 my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl font-black text-indigo-700 flex items-center gap-3">
            <i className="fas fa-flask"></i>
            {chemical ? 'Cập nhật Hóa chất & Lô hàng' : initialStatus === 'DISPOSED' ? 'Khai báo Hóa chất Thanh lý' : 'Cấu hình Hóa chất & Lô hàng'}
          </h2>
          <p className="text-sm text-slate-400">Chọn tên từ danh mục chuẩn và sử dụng AI để tự động lấy thông tin CAS/Formula.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin định danh</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tên hóa chất (Chuẩn Catalog)</label>
                    <div className="flex gap-2 mt-1">
                      <div className="flex-1 relative">
                        <input 
                          list="master-chemicals"
                          type="text" 
                          required 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold shadow-inner"
                          placeholder="Nhập hoặc chọn tên chuẩn..."
                        />
                        <datalist id="master-chemicals">
                          {MASTER_CHEMICAL_NAMES.map((name, idx) => (
                            <option key={idx} value={name} />
                          ))}
                        </datalist>
                      </div>
                      <button 
                        type="button"
                        onClick={handleAISuggest}
                        disabled={loadingAI}
                        className={`px-4 py-2 rounded-lg text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                          loadingAI ? 'bg-indigo-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 active:scale-95'
                        }`}
                      >
                        {loadingAI ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>}
                        <span>Gợi ý AI</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Công thức hóa học</label>
                    <input type="text" value={formData.formula} onChange={e => setFormData({...formData, formula: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono shadow-inner"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Số CAS</label>
                    <input type="text" value={formData.casNumber} onChange={e => setFormData({...formData, casNumber: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"/>
                  </div>
                </div>
              </section>

              <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Phân loại & Cảnh báo tồn kho</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Danh mục</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none shadow-inner font-bold text-indigo-700">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <label className="block text-[10px] font-bold text-amber-600 uppercase">Ngưỡng báo động tồn kho</label>
                    <input 
                      type="number" 
                      required
                      value={formData.minThreshold} 
                      onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} 
                      className="mt-1 w-full border-amber-200 border rounded-lg px-3 py-2 bg-white font-black text-amber-700 outline-none shadow-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Trạng thái vật lý</label>
                    <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value as PhysicalState})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none shadow-inner font-bold text-indigo-700">
                      {Object.values(PhysicalState).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Hạn mở nắp (Ngày)</label>
                    <input type="number" value={formData.defaultPaoDays} onChange={e => setFormData({...formData, defaultPaoDays: Number(e.target.value)})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white font-bold text-indigo-600 outline-none shadow-inner"/>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className={`${initialStatus === 'DISPOSED' ? 'bg-red-50/50 border-red-100' : 'bg-indigo-50/50 border-indigo-100'} p-6 rounded-xl border relative shadow-sm`}>
                <h3 className={`text-xs font-black ${initialStatus === 'DISPOSED' ? 'text-red-400' : 'text-indigo-400'} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                  <i className="fas fa-boxes"></i> Lô hàng khởi tạo
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase">Số lô nội bộ *</label>
                      <input 
                        type="text" 
                        value={lotData.lotNumber} 
                        onChange={e => setLotData({...lotData, lotNumber: e.target.value})} 
                        className={`mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none shadow-inner ${showErrors && !lotData.lotNumber ? 'border-red-500' : ''}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase">Số lượng</label>
                      <input type="number" value={lotData.quantity} onChange={e => setLotData({...lotData, quantity: Number(e.target.value)})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none font-bold shadow-inner"/>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase ${showErrors && !lotData.expiryDate ? 'text-red-600' : ''}`}>Ngày hết hạn *</label>
                    <input 
                      type="date" 
                      value={lotData.expiryDate} 
                      onChange={e => setLotData({...lotData, expiryDate: e.target.value})} 
                      className={`mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none text-xs shadow-inner ${showErrors && !lotData.expiryDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
              </section>
              
              <section className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 shadow-sm">
                <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4">Vị trí & NCC</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Vị trí lưu trữ</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none shadow-inner" placeholder="Tủ, Kệ..."/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nhà cung cấp</label>
                    <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white outline-none shadow-inner" placeholder="Tên NCC..."/>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-8 py-2.5 border border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-all">Hủy bỏ</button>
            <button type="submit" className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
              {chemical ? 'CẬP NHẬT DỮ LIỆU' : 'LƯU CẤU HÌNH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChemicalForm;
