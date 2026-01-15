
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Chemical, UserRole, AuditLog, PhysicalState, ChemicalLot } from './types';
import { INITIAL_CHEMICALS, CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import ChemicalList from './components/ChemicalList';
import ChemicalForm from './components/ChemicalForm';
import LotForm from './components/LotForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SafetyAdvisor from './components/SafetyAdvisor';
import * as XLSX from 'https://esm.sh/xlsx';

const STORAGE_KEY = 'chemtrack_pro_data';

const App: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CHEMICALS;
  });
  
  const [history, setHistory] = useState<Chemical[][]>([]); 
  const [redoStack, setRedoStack] = useState<Chemical[][]>([]); 
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState<'inventory' | 'consumed' | 'disposal' | 'logs' | 'advisor'>('inventory');
  const [subTab, setSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [logFilter, setLogFilter] = useState<'ALL' | 'USAGE' | 'MASTER' | 'INVENTORY'>('ALL');

  const [showForm, setShowForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [initialFormStatus, setInitialFormStatus] = useState<ChemicalLot['status']>('RESERVED');
  const [editingChemical, setEditingChemical] = useState<Chemical | undefined>(undefined);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'undo' | 'redo' | 'warning' } | null>(null);

  // Export Excel Logic
  const handleExportExcel = () => {
    try {
      const inventoryData = chemicals.flatMap(chem => 
        chem.lots.map(lot => ({
          'Mã HC': chem.code,
          'Tên Hóa Chất': chem.name,
          'Công Thức': chem.formula,
          'Số CAS': chem.casNumber,
          'Danh Mục': chem.category,
          'Trạng Thái': chem.state,
          'Số Lô NSX': lot.mfgLotNumber,
          'Số Lô Nội Bộ': lot.lotNumber,
          'Số Lượng': lot.quantity,
          'Đơn Vị': lot.unit,
          'Ngày Nhập': lot.entryDate,
          'Ngày Hết Hạn': lot.expiryDate,
          'Ngày Mở Nắp': lot.openedDate || '',
          'Tình Trạng': lot.status,
          'Vị Trí': chem.location,
          'Nhà Cung Cấp': chem.supplier
        }))
      );

      const logsData = auditLogs.map(log => ({
        'Thời Gian': new Date(log.timestamp).toLocaleString('vi-VN'),
        'Hành Động': log.action,
        'Hóa Chất': log.chemicalName || '',
        'Số Lô': log.lotNumber || '',
        'Thay Đổi': log.amount ? `${log.amount} ${log.unit}` : '',
        'Chi Tiết': log.details,
        'Người Thực Hiện': log.userName
      }));

      const wb = XLSX.utils.book_new();
      const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
      const wsLogs = XLSX.utils.json_to_sheet(logsData);

      XLSX.utils.book_append_sheet(wb, wsInventory, "Tồn Kho Hiện Tại");
      XLSX.utils.book_append_sheet(wb, wsLogs, "Nhật Ký Hệ Thống");

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      XLSX.writeFile(wb, `Bao_Cao_ChemTrack_Pro_${dateStr}.xlsx`);
      
      showToast('Đã xuất báo cáo Excel thành công!', 'success');
    } catch (error) {
      console.error("Export Error:", error);
      showToast('Lỗi khi xuất file Excel', 'warning');
    }
  };

  // Persistence Logic
  const handleSaveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chemicals));
    setHasUnsavedChanges(false);
    showToast('Dữ liệu đã được lưu an toàn!', 'success');
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveToHistory = useCallback(() => {
    setHistory(prev => [JSON.parse(JSON.stringify(chemicals)), ...prev].slice(0, 20));
    setRedoStack([]); 
    setHasUnsavedChanges(true);
  }, [chemicals]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const currentState = JSON.parse(JSON.stringify(chemicals));
      const previousState = history[0];
      setRedoStack(prev => [currentState, ...prev]);
      setChemicals(previousState);
      setHistory(prev => prev.slice(1));
      showToast('Đã hoàn tác thao tác', 'undo');
      addLog('STATUS_CHANGE', 'system', 'Hoàn tác (Undo)');
      setHasUnsavedChanges(true);
    }
  }, [history, chemicals]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const currentState = JSON.parse(JSON.stringify(chemicals));
      const nextState = redoStack[0];
      setHistory(prev => [currentState, ...prev]);
      setChemicals(nextState);
      setRedoStack(prev => prev.slice(1));
      showToast('Đã làm lại thao tác', 'redo');
      addLog('STATUS_CHANGE', 'system', 'Làm lại (Redo)');
      setHasUnsavedChanges(true);
    }
  }, [redoStack, chemicals]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') {
          if (e.shiftKey) { e.preventDefault(); handleRedo(); }
          else { e.preventDefault(); handleUndo(); }
        } else if (e.key === 'y') { e.preventDefault(); handleRedo(); }
        else if (e.key === 's') { e.preventDefault(); handleSaveData(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, chemicals]);

  const showToast = (message: string, type: 'info' | 'success' | 'undo' | 'redo' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const today = new Date();
    setChemicals(prev => prev.map(c => ({
      ...c,
      lots: c.lots.map(l => {
        if (l.status !== 'EXPIRED' && l.status !== 'DISPOSED' && l.status !== 'CONSUMED') {
          if (new Date(l.expiryDate) < today) {
            return { ...l, status: 'EXPIRED' as const };
          }
        }
        return l;
      })
    })));
  }, []);

  const addLog = (
    action: AuditLog['action'], 
    entityId: string, 
    details: string, 
    chemicalName?: string, 
    lotNumber?: string,
    amount?: number,
    unit?: string
  ) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: 'tech-01',
      userName: 'KTV Trưởng',
      action,
      entityId,
      chemicalName,
      lotNumber,
      amount,
      unit,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const filteredChemicals = useMemo(() => {
    return chemicals.filter(c => {
      const totalStock = c.lots
        .filter(l => l.status === 'RESERVED' || l.status === 'IN_USE')
        .reduce((sum, l) => sum + l.quantity, 0);

      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.casNumber.includes(searchQuery) ||
                           c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSubTab = subTab === 'all' || 
                           (subTab === 'solid' && c.state === PhysicalState.SOLID) ||
                           (subTab === 'liquid' && c.state === PhysicalState.LIQUID) ||
                           (subTab === 'hazardous' && (c.nfpa.health >= 3 || c.nfpa.flammability >= 3)) ||
                           (subTab === 'lowstock' && totalStock <= (c.minThreshold || 0));

      const hasCorrectStatus = c.lots.some(l => {
        if (activeTab === 'inventory') return l.status === 'RESERVED' || l.status === 'IN_USE';
        if (activeTab === 'consumed') return l.status === 'CONSUMED';
        if (activeTab === 'disposal') return l.status === 'EXPIRED' || l.status === 'DISPOSED';
        return true;
      });

      return matchesSearch && matchesCategory && hasCorrectStatus && matchesSubTab;
    }).map(c => ({
      ...c,
      lots: c.lots.filter(l => {
        if (activeTab === 'inventory') return l.status === 'RESERVED' || l.status === 'IN_USE';
        if (activeTab === 'consumed') return l.status === 'CONSUMED';
        if (activeTab === 'disposal') return l.status === 'EXPIRED' || l.status === 'DISPOSED';
        return true;
      })
    })).filter(c => c.lots.length > 0);
  }, [chemicals, searchQuery, selectedCategory, activeTab, subTab]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (logFilter === 'ALL') return true;
      if (logFilter === 'USAGE') return log.action === 'LOT_USAGE' || log.action === 'OPEN_LOT' || log.action === 'CONSUME_ALL';
      if (logFilter === 'MASTER') return log.action === 'CREATE' || log.action === 'UPDATE' || log.action === 'DELETE';
      if (logFilter === 'INVENTORY') return log.action === 'ADD_LOT' || log.action === 'LOT_STOCK_IN';
      return true;
    });
  }, [auditLogs, logFilter]);

  const handleLotAction = (chemId: string, lotId: string, action: 'OPEN' | 'USAGE' | 'STOCK_IN' | 'DISPOSE' | 'CONSUME_ALL', amount?: number, customDate?: string) => {
    saveToHistory();
    const today = new Date().toISOString().split('T')[0];
    const targetDate = customDate || today;
    let details = '';
    let currentChemName = '';
    let currentLotNum = '';
    let currentUnit = '';

    setChemicals(prev => prev.map(c => {
      if (c.id === chemId) {
        currentChemName = c.name;
        return {
          ...c,
          lots: c.lots.map(l => {
            if (l.id === lotId) {
              currentLotNum = l.lotNumber;
              currentUnit = l.unit;
              if (action === 'OPEN') {
                details = `Mở nắp hóa chất vào ngày ${targetDate}`;
                return { ...l, openedDate: targetDate, status: 'IN_USE' as const, paoDays: c.defaultPaoDays };
              }
              if (action === 'USAGE' && amount) {
                const newQty = Math.max(0, l.quantity - amount);
                details = `Sử dụng ${amount} ${l.unit} vào ngày ${targetDate}`;
                if (newQty === 0) return { ...l, quantity: 0, status: 'CONSUMED' as const, lastUsedDate: targetDate };
                return { ...l, quantity: newQty, lastUsedDate: targetDate };
              }
              if (action === 'STOCK_IN' && amount) {
                details = `Nhập thêm/Hoàn trả ${amount} ${l.unit} vào ngày ${targetDate}`;
                const newQty = l.quantity + amount;
                let newStatus = l.status;
                if (l.status === 'CONSUMED' && newQty > 0) {
                   newStatus = l.openedDate ? 'IN_USE' : 'RESERVED';
                }
                return { ...l, quantity: newQty, status: newStatus, lastUsedDate: targetDate };
              }
              if (action === 'DISPOSE') {
                details = `Chuyển sang mục Chờ thanh lý vào ngày ${targetDate}`;
                return { ...l, status: 'DISPOSED' as const };
              }
              if (action === 'CONSUME_ALL') {
                details = `Xác nhận đã dùng hết vào ngày ${targetDate}`;
                return { ...l, quantity: 0, status: 'CONSUMED' as const, lastUsedDate: targetDate };
              }
            }
            return l;
          })
        };
      }
      return c;
    }));

    const logAction = 
      action === 'DISPOSE' ? 'STATUS_CHANGE' : 
      action === 'STOCK_IN' ? 'LOT_STOCK_IN' : 
      action === 'CONSUME_ALL' ? 'CONSUME_ALL' : 'LOT_USAGE';

    addLog(logAction as any, lotId, details, currentChemName, currentLotNum, amount, currentUnit);
    if (action === 'CONSUME_ALL') showToast('Đã xác nhận dùng hết lô hàng', 'success');
  };

  const handleAddLot = (chemId: string, newLot: ChemicalLot) => {
    saveToHistory();
    const chem = chemicals.find(c => c.id === chemId);
    setChemicals(prev => prev.map(c => {
      if (c.id === chemId) {
        return { ...c, lots: [...c.lots, newLot] };
      }
      return c;
    }));
    addLog('ADD_LOT', newLot.id, `Nhập mới lô hàng: ${newLot.lotNumber}`, chem?.name, newLot.lotNumber, newLot.quantity, newLot.unit);
    setShowLotForm(false);
    showToast('Đã nhập kho số lô mới');
  };

  const handleSaveChemical = (chemical: Chemical) => {
    saveToHistory();
    if (editingChemical) {
      setChemicals(prev => prev.map(c => c.id === chemical.id ? chemical : c));
      addLog('UPDATE', chemical.id, `Cập nhật thông tin Master`, chemical.name);
    } else {
      const newChem = { ...chemical, id: Math.random().toString(36).substr(2, 9) };
      setChemicals(prev => [...prev, newChem]);
      addLog('CREATE', newChem.id, `Tạo mới hóa chất trong danh mục`, newChem.name);
      if (newChem.lots.length > 0) {
        const firstLot = newChem.lots[0];
        addLog('ADD_LOT', firstLot.id, `Lô hàng khởi tạo: ${firstLot.lotNumber}`, newChem.name, firstLot.lotNumber, firstLot.quantity, firstLot.unit);
      }
    }
    setShowForm(false);
    setEditingChemical(undefined);
    showToast('Đã lưu thành công');
  };

  const handleDelete = (id: string) => {
    saveToHistory();
    const chem = chemicals.find(c => c.id === id);
    setChemicals(prev => prev.filter(c => c.id !== id));
    addLog('DELETE', id, 'Xóa hóa chất hoàn toàn khỏi hệ thống', chem?.name);
    showToast('Đã xóa dữ liệu');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSubTab('all'); }} subTab={subTab} setSubTab={setSubTab} />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Header userRole={userRole} setUserRole={setUserRole} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {/* Undo/Redo/Save Buttons */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
             {hasUnsavedChanges && (
                <button 
                  onClick={handleSaveData}
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-black hover:bg-emerald-700 transition-all border border-emerald-400 group animate-bounce-subtle"
                >
                  <i className="fas fa-save"></i> LƯU DỮ LIỆU (Ctrl+S)
                  <span className="bg-emerald-500 w-2 h-2 rounded-full ml-1"></span>
                </button>
             )}
             {redoStack.length > 0 && (
                <button onClick={handleRedo} className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-indigo-700 transition-all border border-indigo-400 group">
                  <i className="fas fa-redo"></i> Làm lại (Ctrl+Y)
                  <span className="bg-indigo-500 px-1.5 py-0.5 rounded text-[10px] ml-1">{redoStack.length}</span>
                </button>
             )}
             {history.length > 0 && (
                <button onClick={handleUndo} className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-slate-700 transition-all border border-slate-600 group">
                  <i className="fas fa-undo"></i> Hoàn tác (Ctrl+Z)
                  <span className="bg-slate-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{history.length}</span>
                </button>
             )}
        </div>

        {toast && (
          <div className={`fixed top-20 right-8 z-50 animate-in slide-in-from-right-10 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border font-bold text-sm ${
            toast.type === 'undo' ? 'bg-indigo-600 text-white' : 
            toast.type === 'redo' ? 'bg-emerald-600 text-white' : 
            toast.type === 'success' ? 'bg-white text-slate-800' : 'bg-orange-50 text-orange-800 border-orange-200'
          }`}>
            <i className={`fas ${toast.type === 'undo' ? 'fa-history' : toast.type === 'redo' ? 'fa-redo' : 'fa-check-circle text-emerald-500'}`}></i>
            {toast.message}
          </div>
        )}

        <div className="p-8 max-w-7xl mx-auto w-full">
          {(activeTab === 'inventory' || activeTab === 'consumed' || activeTab === 'disposal') && (
            <>
              <div className="flex justify-between items-end mb-6">
                <div>
                   <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                     {activeTab === 'inventory' ? 'Kho Hóa chất' : 
                      activeTab === 'consumed' ? 'Đã tiêu thụ' : 'Khu vực Thanh lý'}
                   </h1>
                </div>
                <div className="flex space-x-2">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                    <option value="All">Danh mục: Tất cả</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {activeTab === 'inventory' && (
                    <button onClick={() => { setInitialFormStatus('RESERVED'); setShowForm(true); }} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-bold shadow-md transition-all active:scale-95">
                      <i className="fas fa-plus mr-2"></i>Thêm hóa chất
                    </button>
                  )}
                </div>
              </div>
              <Dashboard chemicals={chemicals} onExportExcel={handleExportExcel} />
              <ChemicalList 
                chemicals={filteredChemicals} 
                auditLogs={auditLogs}
                userRole={userRole} 
                onEdit={(c) => { setEditingChemical(c); setShowForm(true); }} 
                onDelete={handleDelete} 
                onLotAction={handleLotAction}
                onAddLot={(chemId) => {
                  const chem = chemicals.find(c => c.id === chemId);
                  setEditingChemical(chem);
                  setShowLotForm(true);
                }}
              />
            </>
          )}
          {activeTab === 'logs' && (
             /* Logs Section UI - Same as before */
             <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                   <div>
                     <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <i className="fas fa-history text-indigo-400"></i> Audit Trail
                     </h1>
                     <p className="text-slate-400 text-xs mt-1 font-medium italic">Ghi lại toàn bộ lịch sử biến động dữ liệu hệ thống</p>
                   </div>
                   
                   <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
                      {[
                        { id: 'ALL', label: 'Tất cả' },
                        { id: 'USAGE', label: 'Sử dụng' },
                        { id: 'INVENTORY', label: 'Kho vận' },
                        { id: 'MASTER', label: 'Dữ liệu gốc' }
                      ].map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setLogFilter(tab.id as any)}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            logFilter === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black border-b">
                        <tr>
                          <th className="px-6 py-4">Thời gian</th>
                          <th className="px-6 py-4">Hóa chất / Lô</th>
                          <th className="px-6 py-4">Hành động</th>
                          <th className="px-6 py-4">Chi tiết thay đổi</th>
                          <th className="px-6 py-4">Người thực hiện</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">
                               <i className="fas fa-folder-open text-4xl mb-3 block opacity-20"></i>
                               Không tìm thấy nhật ký trong danh mục này
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.map(log => {
                            const isUsage = log.action === 'LOT_USAGE' || log.action === 'OPEN_LOT' || log.action === 'CONSUME_ALL';
                            const isInventory = log.action === 'ADD_LOT' || log.action === 'LOT_STOCK_IN';
                            const isMaster = log.action === 'CREATE' || log.action === 'UPDATE';
                            const isDanger = log.action === 'DELETE' || log.action === 'STATUS_CHANGE';

                            return (
                              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-900">{log.chemicalName || '--'}</span>
                                    {log.lotNumber && <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 w-fit font-mono mt-0.5">Lot: {log.lotNumber}</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                                    isUsage ? 'bg-emerald-100 text-emerald-700' :
                                    isInventory ? 'bg-blue-100 text-blue-700' :
                                    isMaster ? 'bg-amber-100 text-amber-700' :
                                    isDanger ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-xs text-slate-600 font-medium">{log.details}</p>
                                    {log.amount && (
                                      <span className="text-[10px] font-black text-indigo-500">
                                        Lượng: {log.amount} {log.unit}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                      {log.userName.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{log.userName}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
             </div>
          )}
          {activeTab === 'advisor' && <SafetyAdvisor chemicals={chemicals} />}
        </div>
      </main>

      {showForm && (
        <ChemicalForm chemical={editingChemical} initialStatus={initialFormStatus} onSave={handleSaveChemical} onClose={() => { setShowForm(false); setEditingChemical(undefined); }} />
      )}
      
      {showLotForm && editingChemical && (
        <LotForm chemical={editingChemical} onSave={handleAddLot} onClose={() => { setShowLotForm(false); setEditingChemical(undefined); }} />
      )}
    </div>
  );
};

export default App;
