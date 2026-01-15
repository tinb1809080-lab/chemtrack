
import React, { useState } from 'react';
import { Chemical, UserRole } from '../types';
import NFPADiamond from './NFPADiamond';

interface ChemicalListProps {
  chemicals: Chemical[];
  userRole: UserRole;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onStockAction: (id: string, type: 'IN' | 'OUT', amount: number, date: string) => void;
}

const ChemicalList: React.FC<ChemicalListProps> = ({ chemicals, userRole, onEdit, onDelete, onStockAction }) => {
  const today = new Date().toISOString().split('T')[0];
  const [stockAmount, setStockAmount] = useState<{[key: string]: number}>({});
  const [actionDates, setActionDates] = useState<{[key: string]: string}>({});

  const isExpired = (date: string) => new Date(date) < new Date();
  const isNearExpiry = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return diff > 0 && diff < (30 * 24 * 60 * 60 * 1000); // 30 days
  };

  const handleKeyPress = (e: React.KeyboardEvent, chemId: string) => {
    if (e.key === 'Enter') {
      const amount = stockAmount[chemId] || 0;
      const date = actionDates[chemId] || today;
      if (amount > 0) {
        onStockAction(chemId, 'IN', amount, date);
        setStockAmount({ ...stockAmount, [chemId]: 0 });
      } else if (amount < 0) {
        onStockAction(chemId, 'OUT', Math.abs(amount), date);
        setStockAmount({ ...stockAmount, [chemId]: 0 });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Chemical Info</th>
              <th className="px-6 py-4">Hazard (NFPA)</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Stock Status</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chemicals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                  No chemicals found. Adjust your search or filters.
                </td>
              </tr>
            ) : (
              chemicals.map(chem => (
                <tr key={chem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{chem.name}</span>
                      <span className="text-xs text-gray-500">{chem.formula} | CAS: {chem.casNumber}</span>
                      <span className="text-[10px] mt-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit">{chem.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <NFPADiamond rating={chem.nfpa} size="sm" />
                      <div className="flex flex-wrap gap-1">
                        {chem.hazardGHS.map(h => (
                          <span key={h} className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <i className="fas fa-map-marker-alt text-gray-400"></i>
                      {chem.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${chem.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                          {chem.stock} {chem.unit}
                        </span>
                        {chem.stock < 10 && <i className="fas fa-exclamation-triangle text-orange-400 text-xs"></i>}
                      </div>
                      {userRole !== UserRole.VIEWER && (
                        <div className="flex mt-2 gap-1 items-center">
                          <input 
                            type="date"
                            className="w-28 text-[10px] border rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={actionDates[chem.id] || today}
                            onChange={(e) => setActionDates({...actionDates, [chem.id]: e.target.value})}
                          />
                          <input 
                            type="number"
                            className="w-16 text-xs border rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none" 
                            placeholder="Qty (+/-)"
                            value={stockAmount[chem.id] === 0 ? '' : (stockAmount[chem.id] || '')}
                            onChange={(e) => setStockAmount({...stockAmount, [chem.id]: Number(e.target.value)})}
                            onKeyDown={(e) => handleKeyPress(e, chem.id)}
                            title="Enter positive to add, negative to subtract"
                          />
                          <button 
                            onClick={() => { onStockAction(chem.id, 'IN', stockAmount[chem.id] || 0, actionDates[chem.id] || today); setStockAmount({...stockAmount, [chem.id]: 0}); }}
                            className="bg-blue-50 text-blue-600 p-1 rounded hover:bg-blue-100 transition"
                            title="Add stock"
                          >
                            <i className="fas fa-plus text-[10px]"></i>
                          </button>
                          <button 
                            onClick={() => { onStockAction(chem.id, 'OUT', stockAmount[chem.id] || 0, actionDates[chem.id] || today); setStockAmount({...stockAmount, [chem.id]: 0}); }}
                            className="bg-orange-50 text-orange-600 p-1 rounded hover:bg-orange-100 transition"
                            title="Subtract stock"
                          >
                            <i className="fas fa-minus text-[10px]"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm ${isExpired(chem.expiryDate) ? 'text-red-600 font-bold' : isNearExpiry(chem.expiryDate) ? 'text-orange-500' : 'text-gray-600'}`}>
                        {chem.expiryDate}
                      </span>
                      {isExpired(chem.expiryDate) && <span className="text-[10px] text-red-500 uppercase font-bold">Expired</span>}
                      {isNearExpiry(chem.expiryDate) && !isExpired(chem.expiryDate) && <span className="text-[10px] text-orange-500 uppercase font-bold">Expires Soon</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => onEdit(chem)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {userRole === UserRole.ADMIN && (
                        <button 
                          onClick={() => onDelete(chem.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChemicalList;
