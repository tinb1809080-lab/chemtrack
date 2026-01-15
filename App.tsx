
import React, { useState, useMemo, useEffect } from 'react';
import { Chemical, UserRole, AuditLog, Transaction } from './types';
import { INITIAL_CHEMICALS } from './constants';
import Dashboard from './components/Dashboard';
import ChemicalList from './components/ChemicalList';
import ChemicalForm from './components/ChemicalForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SafetyAdvisor from './components/SafetyAdvisor';

const App: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>(INITIAL_CHEMICALS);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState<'inventory' | 'reports' | 'logs' | 'advisor'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | undefined>(undefined);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Filtering Logic
  const filteredChemicals = useMemo(() => {
    return chemicals.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.casNumber.includes(searchQuery) ||
                           c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [chemicals, searchQuery, selectedCategory]);

  const addLog = (action: AuditLog['action'], entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: 'user-01',
      userName: 'Current User',
      action,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSaveChemical = (chemical: Chemical) => {
    if (editingChemical) {
      setChemicals(prev => prev.map(c => c.id === chemical.id ? chemical : c));
      addLog('UPDATE', chemical.id, `Updated chemical ${chemical.name}`);
    } else {
      const newChem = { ...chemical, id: Math.random().toString(36).substr(2, 9) };
      setChemicals(prev => [...prev, newChem]);
      addLog('CREATE', newChem.id, `Added new chemical ${newChem.name}`);
    }
    setShowForm(false);
    setEditingChemical(undefined);
  };

  const handleDeleteChemical = (id: string) => {
    if (userRole !== UserRole.ADMIN) {
      alert("Only Admins can delete chemicals.");
      return;
    }
    const chem = chemicals.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete ${chem?.name}?`)) {
      setChemicals(prev => prev.filter(c => c.id !== id));
      addLog('DELETE', id, `Deleted chemical ${chem?.name}`);
    }
  };

  const handleStockAction = (id: string, type: 'IN' | 'OUT', amount: number, date: string) => {
    setChemicals(prev => prev.map(c => {
      if (c.id === id) {
        const newStock = type === 'IN' ? c.stock + amount : c.stock - amount;
        return { ...c, stock: Math.max(0, newStock) };
      }
      return c;
    }));
    const chem = chemicals.find(c => c.id === id);
    addLog(
      type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT', 
      id, 
      `${type === 'IN' ? 'Added' : 'Removed'} ${amount} ${chem?.unit} of ${chem?.name} (Effective date: ${date})`
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Header 
          userRole={userRole} 
          setUserRole={setUserRole} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'inventory' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                <div className="flex space-x-2">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border rounded-md px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(chemicals.map(c => c.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {userRole !== UserRole.VIEWER && (
                    <button 
                      onClick={() => setShowForm(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      <i className="fas fa-plus"></i> New Chemical
                    </button>
                  )}
                </div>
              </div>

              <Dashboard chemicals={chemicals} />
              
              <ChemicalList 
                chemicals={filteredChemicals} 
                userRole={userRole}
                onEdit={(c) => { setEditingChemical(c); setShowForm(true); }}
                onDelete={handleDeleteChemical}
                onStockAction={handleStockAction}
              />
            </>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-500 italic">No logs recorded yet.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="flex items-start space-x-4 p-3 border-b border-gray-50 hover:bg-gray-50 rounded transition">
                      <div className={`mt-1 w-2 h-2 rounded-full ${log.action === 'DELETE' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">{log.action}</span>
                          <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-400 mt-1">Performed by: {log.userName}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'advisor' && <SafetyAdvisor chemicals={chemicals} />}
          
          {activeTab === 'reports' && (
             <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center justify-center min-h-[400px]">
                <i className="fas fa-file-invoice text-6xl text-gray-200 mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-700">Export Reports</h2>
                <p className="text-gray-500 mb-6">Download your inventory data in Excel or PDF format.</p>
                <div className="flex space-x-4">
                   <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2">
                      <i className="fas fa-file-excel"></i> Export Excel
                   </button>
                   <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2">
                      <i className="fas fa-file-pdf"></i> Export PDF
                   </button>
                </div>
             </div>
          )}
        </div>
      </main>

      {showForm && (
        <ChemicalForm 
          chemical={editingChemical}
          onSave={handleSaveChemical}
          onClose={() => { setShowForm(false); setEditingChemical(undefined); }}
        />
      )}
    </div>
  );
};

export default App;
