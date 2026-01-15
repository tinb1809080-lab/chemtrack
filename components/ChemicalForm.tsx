
import React, { useState } from 'react';
import { Chemical, PhysicalState, NFPARating } from '../types';
import { CATEGORIES, UNITS } from '../constants';

interface ChemicalFormProps {
  chemical?: Chemical;
  onSave: (chemical: Chemical) => void;
  onClose: () => void;
}

const ChemicalForm: React.FC<ChemicalFormProps> = ({ chemical, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Chemical>>(chemical || {
    code: `CH-${Math.floor(Math.random() * 900) + 100}`,
    name: '',
    formula: '',
    casNumber: '',
    category: CATEGORIES[0],
    state: PhysicalState.SOLID,
    hazardGHS: [],
    nfpa: { health: 0, flammability: 0, instability: 0 },
    stock: 0,
    unit: UNITS[0],
    location: '',
    entryDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    supplier: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Chemical);
  };

  const updateNfpa = (field: keyof NFPARating, value: any) => {
    setFormData(prev => ({
      ...prev,
      nfpa: { ...prev.nfpa!, [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <i className="fas fa-times text-xl"></i>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
          {chemical ? 'Edit Chemical' : 'Add New Chemical'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2 text-gray-600">Identification</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Formula</label>
              <input 
                type="text" required
                value={formData.formula}
                onChange={e => setFormData({...formData, formula: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CAS Number</label>
              <input 
                type="text" required
                value={formData.casNumber}
                onChange={e => setFormData({...formData, casNumber: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2 text-gray-600">Inventory & Logistics</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input 
                  type="number" required min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select 
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Physical State</label>
              <select 
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value as PhysicalState})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                {Object.values(PhysicalState).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input 
                type="text" required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input 
                type="date" required
                value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Safety Section */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2 text-gray-600">Safety (NFPA 704)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-600">Health (0-4)</label>
                <input 
                  type="number" min="0" max="4"
                  value={formData.nfpa?.health}
                  onChange={e => updateNfpa('health', Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-red-600">Flammability (0-4)</label>
                <input 
                  type="number" min="0" max="4"
                  value={formData.nfpa?.flammability}
                  onChange={e => updateNfpa('flammability', Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-yellow-600">Instability (0-4)</label>
                <input 
                  type="number" min="0" max="4"
                  value={formData.nfpa?.instability}
                  onChange={e => updateNfpa('instability', Number(e.target.value))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Special</label>
                <input 
                  type="text"
                  value={formData.nfpa?.special || ''}
                  onChange={e => updateNfpa('special', e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  placeholder="OX, W, SA"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <input 
                type="text"
                value={formData.supplier}
                onChange={e => setFormData({...formData, supplier: e.target.value})}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-6 border-t">
            <button 
              type="button" onClick={onClose}
              className="px-6 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChemicalForm;
