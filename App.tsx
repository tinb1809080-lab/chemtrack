
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Chemical, UserRole, AuditLog, PhysicalState, ChemicalLot, User } from './types';
import { INITIAL_CHEMICALS, CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import ChemicalList from './components/ChemicalList';
import ChemicalForm from './components/ChemicalForm';
import LotForm from './components/LotForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import SafetyAdvisor from './components/SafetyAdvisor';
import PrintLabelModal from './components/PrintLabelModal';
import ProcurementSection from './components/ProcurementSection';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'chemtrack_pro_data';
const LOGS_KEY = 'chemtrack_pro_logs';
const AUTH_KEY = 'chemtrack_session';
const USERS_KEY = 'chemtrack_users';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', password: '123', fullName: 'Quản Trị Viên', email: 'admin@gmail.com', role: UserRole.ADMIN }
    ];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem(AUTH_KEY);
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const [chemicals, setChemicals] = useState<Chemical[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CHEMICALS;
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<Chemical[][]>([]); 
  const [redoStack, setRedoStack] = useState<Chemical[][]>([]); 
  const [activeTab, setActiveTab] = useState<'inventory' | 'consumed' | 'disposal' | 'logs' | 'advisor' | 'system' | 'procurement'>('inventory');
  const [subTab, setSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [showForm, setShowForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState<{chemical: Chemical, lot: ChemicalLot} | null>(null);
  const [initialFormStatus, setInitialFormStatus] = useState<ChemicalLot['status']>('RESERVED');
  const [editingChemical, setEditingChemical] = useState<Chemical | undefined>(undefined);
  
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'undo' | 'redo' | 'warning' } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chemicals));
    localStorage.setItem(LOGS_KEY, JSON.stringify(auditLogs));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [chemicals, auditLogs, users]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    showToast(`Chào mừng trở lại, ${user.fullName}!`, 'success');
  };

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      setCurrentUser(null);
      localStorage.removeItem(AUTH_KEY);
    }
  };

  const handleExportExcel = () => {
    try {
      const inventoryData = chemicals.flatMap(chem => 
        chem.lots.map(lot => ({
          'Tên Hóa Chất': chem.name,
          'CAS': chem.casNumber,
          'Lô': lot.lotNumber,
          'Số lượng': lot.quantity,
          'Đơn vị': lot.unit,
          'Ngày hết hạn': lot.expiryDate,
          'Vị trí': chem.location
        }))
      );
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(wb, "ChemTrack_Report.xlsx");
      showToast('Đã xuất báo cáo Excel', 'success');
    } catch (e) {
      showToast('Lỗi xuất báo cáo', 'warning');
    }
  };

  const saveToHistory = useCallback(() => {
    setHistory(prev => [JSON.parse(JSON.stringify(chemicals)), ...prev].slice(0, 20));
    setRedoStack([]); 
  }, [chemicals]);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      setRedoStack(prev => [JSON.parse(JSON.stringify(chemicals)), ...prev]);
      setChemicals(history[0]);
      setHistory(prev => prev.slice(1));
    }
  }, [history, chemicals]);

  const showToast = (message: string, type: 'info' | 'success' | 'undo' | 'redo' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addLog = (
    action: AuditLog['action'], 
    entityId: string, 
    details: string, 
    chemicalName?: string, 
    lotNumber?: string,
    amount?: number,
    unit?: string,
    customTimestamp?: string
  ) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: customTimestamp || new Date().toISOString(),
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.fullName || 'Ẩn danh',
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
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.casNumber.includes(searchQuery) ||
                           c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSubTab = subTab === 'all' || 
                           (subTab === 'solid' && c.state === PhysicalState.SOLID) ||
                           (subTab === 'liquid' && c.state === PhysicalState.LIQUID) ||
                           (subTab === 'hazardous' && (c.nfpa.health >= 3 || c.nfpa.flammability >= 3));

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

  const handleLotAction = (chemId: string, lotId: string, action: 'OPEN' | 'USAGE' | 'STOCK_IN' | 'DISPOSE' | 'CONSUME_ALL' | 'PRINT' | 'UPDATE_DATES', amount?: number, customDate?: string, extra?: any) => {
    if (currentUser?.role === UserRole.VIEWER) {
      showToast('Bạn không có quyền thực hiện giao dịch!', 'warning');
      return;
    }
    
    if (action === 'PRINT') {
      const chem = chemicals.find(c => c.id === chemId);
      const lot = chem?.lots.find(l => l.id === lotId);
      if (chem && lot) {
        setPrintData({ chemical: chem, lot });
        setShowPrintModal(true);
      }
      return;
    }

    saveToHistory();
    const today = new Date().toISOString().split('T')[0];
    const targetDate = customDate || today;
    let details = '';
    let currentChemName = '';
    let currentLotNum = '';
    let currentUnit = '';
    let logAction: AuditLog['action'] = 'LOT_USAGE';

    setChemicals(prev => prev.map(c => {
      if (c.id === chemId) {
        currentChemName = c.name;
        return {
          ...c,
          lots: c.lots.map(l => {
            if (l.id === lotId) {
              currentLotNum = l.lotNumber;
              currentUnit = l.unit;
              
              if (action === 'UPDATE_DATES' && extra) {
                logAction = 'UPDATE_DATES';
                details = 'Cập nhật thông tin ngày tháng (Nhập/Mở nắp)';
                return { ...l, ...extra };
              }
              
              if (action === 'OPEN') {
                logAction = 'OPEN_LOT';
                details = `Mở nắp hóa chất (${targetDate})`;
                return { ...l, openedDate: targetDate, status: 'IN_USE' as const, paoDays: c.defaultPaoDays };
              }
              if (action === 'USAGE' && amount) {
                logAction = 'LOT_USAGE';
                const newQty = Math.max(0, l.quantity - amount);
                details = `Sử dụng ${amount} ${l.unit} vào ngày ${targetDate}`;
                if (newQty === 0) return { ...l, quantity: 0, status: 'CONSUMED' as const, lastUsedDate: targetDate };
                return { ...l, quantity: newQty, lastUsedDate: targetDate };
              }
              if (action === 'STOCK_IN' && amount) {
                logAction = 'LOT_STOCK_IN';
                details = `Nhập thêm ${amount} ${l.unit} vào ngày ${targetDate}`;
                return { ...l, quantity: l.quantity + amount, lastUsedDate: targetDate };
              }
              if (action === 'DISPOSE') {
                logAction = 'STATUS_CHANGE';
                details = `Chuyển sang khu vực thanh lý (${targetDate})`;
                return { ...l, status: 'DISPOSED' as const };
              }
              if (action === 'CONSUME_ALL') {
                logAction = 'CONSUME_ALL';
                details = `Xác nhận dùng hết (${targetDate})`;
                return { ...l, quantity: 0, status: 'CONSUMED' as const, lastUsedDate: targetDate };
              }
            }
            return l;
          })
        };
      }
      return c;
    }));

    addLog(logAction, lotId, details, currentChemName, currentLotNum, amount, currentUnit, customDate ? new Date(customDate).toISOString() : undefined);
  };

  const handleAddLot = (chemId: string, newLot: ChemicalLot) => {
    if (currentUser?.role === UserRole.VIEWER) return;
    saveToHistory();
    const chem = chemicals.find(c => c.id === chemId);
    setChemicals(prev => prev.map(c => {
      if (c.id === chemId) return { ...c, lots: [...c.lots, newLot] };
      return c;
    }));
    addLog('ADD_LOT', newLot.id, `Nhập lô mới: ${newLot.lotNumber}`, chem?.name, newLot.lotNumber, newLot.quantity, newLot.unit);
    setShowLotForm(false);
  };

  const handleSaveChemical = (chemical: Chemical) => {
    if (currentUser?.role === UserRole.VIEWER) return;
    saveToHistory();
    if (editingChemical) {
      setChemicals(prev => prev.map(c => c.id === chemical.id ? chemical : c));
      addLog('UPDATE', chemical.id, `Cập nhật danh mục Master`, chemical.name);
    } else {
      const newChem = { ...chemical, id: Math.random().toString(36).substr(2, 9) };
      setChemicals(prev => [...prev, newChem]);
      addLog('CREATE', newChem.id, `Tạo mới hóa chất`, newChem.name);
    }
    setShowForm(false);
    setEditingChemical(undefined);
  };

  const handleDelete = (id: string) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      showToast('Chỉ Quản trị viên mới có quyền xóa!', 'warning');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa hóa chất này khỏi hệ thống?')) return;
    saveToHistory();
    const chem = chemicals.find(c => c.id === id);
    setChemicals(prev => prev.filter(c => c.id !== id));
    addLog('DELETE', id, 'Xóa hóa chất', chem?.name);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} onUpdateUsers={handleUpdateUsers} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSubTab('all'); }} subTab={subTab} setSubTab={setSubTab} />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Header user={currentUser} onLogout={handleLogout} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end no-print">
             {history.length > 0 && currentUser.role !== UserRole.VIEWER && (
                <button onClick={handleUndo} className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold hover:bg-slate-700 transition-all">
                  <i className="fas fa-undo"></i> Hoàn tác
                </button>
             )}
        </div>

        {toast && (
          <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-right-10 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border font-bold text-sm bg-white text-slate-800 border-slate-200">
            <i className="fas fa-check-circle text-emerald-500"></i>
            {toast.message}
          </div>
        )}

        <div className="p-8 max-w-7xl mx-auto w-full">
          {(activeTab === 'inventory' || activeTab === 'consumed' || activeTab === 'disposal') && (
            <>
              <div className="flex justify-between items-end mb-6 no-print">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                  {activeTab === 'inventory' ? 'Kho Hóa chất' : activeTab === 'consumed' ? 'Đã tiêu thụ' : 'Khu vực Thanh lý'}
                </h1>
                <div className="flex space-x-2">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 bg-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                    <option value="All">Tất cả danh mục</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {activeTab === 'inventory' && currentUser.role !== UserRole.VIEWER && (
                    <button onClick={() => { setInitialFormStatus('RESERVED'); setShowForm(true); }} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-bold shadow-md transition-all">
                      <i className="fas fa-plus mr-2"></i>Thêm hóa chất
                    </button>
                  )}
                </div>
              </div>
              <Dashboard chemicals={chemicals} onExportExcel={handleExportExcel} />
              <ChemicalList 
                chemicals={filteredChemicals} 
                auditLogs={auditLogs}
                userRole={currentUser.role} 
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

          {activeTab === 'procurement' && (
            <ProcurementSection chemicals={chemicals} />
          )}

          {activeTab === 'system' && currentUser.role === UserRole.ADMIN && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500 max-w-4xl mx-auto">
               <div className="bg-slate-900 p-8 text-white">
                  <h1 className="text-3xl font-black flex items-center gap-4">
                     <i className="fas fa-cogs text-indigo-400"></i> Quản trị Hệ thống
                  </h1>
                  <p className="text-slate-400 mt-2 font-medium">Quản lý cơ sở dữ liệu và bảo mật.</p>
               </div>
               <div className="p-10 space-y-12">
                  <section>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Quản lý Tài khoản ({users.length})</h3>
                     <div className="space-y-4">
                        {users.map(u => (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                              <p className="font-bold text-slate-800">{u.fullName} <span className="text-[10px] text-indigo-600 font-black ml-2 uppercase bg-indigo-50 px-2 py-0.5 rounded">{u.role}</span></p>
                              <p className="text-xs text-slate-500">{u.email} | ID: {u.username}</p>
                            </div>
                            {u.role !== UserRole.ADMIN && (
                              <button 
                                onClick={() => setUsers(prev => prev.filter(x => x.id !== u.id))}
                                className="text-red-400 hover:text-red-600 p-2"
                              ><i className="fas fa-user-minus"></i></button>
                            )}
                          </div>
                        ))}
                     </div>
                  </section>
               </div>
            </div>
          )}

          {activeTab === 'logs' && (
             <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                   <h1 className="text-2xl font-black text-white flex items-center gap-3">
                      <i className="fas fa-history text-indigo-400"></i> Nhật ký hoạt động
                   </h1>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black border-b">
                        <tr>
                          <th className="px-6 py-4">Thời gian</th>
                          <th className="px-6 py-4">Người thực hiện</th>
                          <th className="px-6 py-4">Hóa chất / Lô</th>
                          <th className="px-6 py-4">Hành động</th>
                          <th className="px-6 py-4">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-slate-700">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 text-xs font-black text-indigo-600">{log.userName}</td>
                            <td className="px-6 py-4 text-xs font-black text-slate-900">{log.chemicalName}</td>
                            <td className="px-6 py-4"><span className="text-[9px] font-black px-2 py-1 bg-indigo-50 text-indigo-700 rounded uppercase">{log.action}</span></td>
                            <td className="px-6 py-4 text-xs text-slate-600 font-medium">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
             </div>
          )}
          {activeTab === 'advisor' && <SafetyAdvisor chemicals={chemicals} />}
        </div>
      </main>

      {showForm && <ChemicalForm chemical={editingChemical} initialStatus={initialFormStatus} onSave={handleSaveChemical} onClose={() => { setShowForm(false); setEditingChemical(undefined); }} />}
      {showLotForm && editingChemical && <LotForm chemical={editingChemical} onSave={handleAddLot} onClose={() => { setShowLotForm(false); setEditingChemical(undefined); }} />}
      {showPrintModal && printData && <PrintLabelModal chemical={printData.chemical} lot={printData.lot} onClose={() => setShowPrintModal(false)} />}
    </div>
  );
};

export default App;
