
import React, { useState } from 'react';
import { Chemical } from '../types';
import { getSafetyAdvice } from '../services/geminiService';

interface SafetyAdvisorProps {
  chemicals: Chemical[];
}

const SafetyAdvisor: React.FC<SafetyAdvisorProps> = ({ chemicals }) => {
  const [selectedChemId, setSelectedChemId] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    const chem = chemicals.find(c => c.id === selectedChemId);
    if (!chem) return;

    setLoading(true);
    setAdvice(null);
    const result = await getSafetyAdvice(chem.name, chem.casNumber);
    setAdvice(result || "No safety data available.");
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl">
          <i className="fas fa-robot"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Safety AI Advisor</h2>
          <p className="text-sm text-gray-500">Powered by Gemini for advanced chemical risk assessment.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a chemical for analysis</label>
          <div className="flex gap-3">
            <select 
              value={selectedChemId}
              onChange={(e) => setSelectedChemId(e.target.value)}
              className="flex-1 border rounded-lg px-4 py-2 bg-gray-50"
            >
              <option value="">-- Choose from Inventory --</option>
              {chemicals.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.formula})</option>
              ))}
            </select>
            <button 
              onClick={handleGetAdvice}
              disabled={!selectedChemId || loading}
              className={`px-6 py-2 rounded-lg font-bold text-white transition ${
                loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Analyze Safety'}
            </button>
          </div>
        </div>

        {advice && (
          <div className="mt-8 animate-in fade-in duration-500">
             <div className="p-6 bg-slate-50 border-l-4 border-indigo-500 rounded-r-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <i className="fas fa-clipboard-check text-indigo-500"></i> Expert Recommendation
                </h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-600 leading-relaxed">
                   {advice}
                </div>
             </div>
             <p className="mt-4 text-[10px] text-gray-400 italic">
                Disclaimer: AI advice is for reference only. Always consult official SDS/MSDS documents for critical safety procedures.
             </p>
          </div>
        )}

        {!advice && !loading && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
            <i className="fas fa-shield-alt text-4xl mb-4"></i>
            <p>Select a chemical and click "Analyze Safety" to generate a detailed AI risk assessment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyAdvisor;
