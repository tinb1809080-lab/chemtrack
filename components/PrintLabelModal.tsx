
import React from 'react';
import { Chemical, ChemicalLot } from '../types';
import NFPADiamond from './NFPADiamond';

interface PrintLabelModalProps {
  chemical: Chemical;
  lot: ChemicalLot;
  onClose: () => void;
}

const PrintLabelModal: React.FC<PrintLabelModalProps> = ({ chemical, lot, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800">In Nhãn Hóa Chất</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-10 flex justify-center bg-slate-100/50">
          {/* Mẫu Nhãn In */}
          <div id="printable-label" className="bg-white border-2 border-black p-4 w-[8cm] h-[5cm] shadow-lg flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-black print:m-0 print:w-full print:h-full">
            <div className="flex justify-between items-start border-b border-black pb-1 mb-1">
              <div className="flex-1">
                <h2 className="text-sm font-black uppercase leading-tight line-clamp-2">{chemical.name}</h2>
                <p className="text-[10px] font-mono font-bold">{chemical.formula}</p>
              </div>
              <div className="transform scale-[0.6] origin-top-right ml-2">
                 <NFPADiamond rating={chemical.nfpa} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 text-[9px] font-bold">
              <div>
                <p className="text-[7px] text-gray-500 uppercase">Số Lô NSX:</p>
                <p className="truncate">{lot.mfgLotNumber}</p>
              </div>
              <div>
                <p className="text-[7px] text-gray-500 uppercase">Lô Nội Bộ:</p>
                <p>{lot.lotNumber}</p>
              </div>
              <div>
                <p className="text-[7px] text-gray-500 uppercase">CAS Number:</p>
                <p>{chemical.casNumber}</p>
              </div>
              <div>
                <p className="text-[7px] text-gray-500 uppercase">Ngày Nhập:</p>
                <p>{lot.entryDate}</p>
              </div>
            </div>

            <div className="mt-2 pt-1 border-t border-black flex justify-between items-end">
               <div>
                  <p className="text-[7px] text-gray-500 uppercase">Hạn Sử Dụng:</p>
                  <p className="text-[10px] font-black text-red-600">{lot.expiryDate}</p>
               </div>
               <div className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase rounded">
                  {chemical.state}
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-4">
           <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-100 rounded-xl transition-all uppercase text-xs">Hủy</button>
           <button onClick={handlePrint} className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 transition-all uppercase text-xs flex items-center justify-center gap-2">
              <i className="fas fa-print"></i> XÁC NHẬN IN
           </button>
        </div>
        
        <div className="px-6 pb-6">
           <p className="text-[10px] text-slate-400 text-center italic">Mẹo: Điều chỉnh tỉ lệ in (Scale) trong trình duyệt nếu nhãn bị lệch.</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-label, #printable-label * { visibility: visible; }
          #printable-label {
            position: fixed;
            left: 0;
            top: 0;
            width: 8cm !important;
            height: 5cm !important;
            border: 2px solid black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintLabelModal;
