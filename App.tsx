
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  List, 
  Clock, 
  CheckCircle2, 
  Building2, 
  User as UserIcon, 
  FileWarning, 
  PartyPopper,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Database,
  Download,
  Upload,
  Tags,
  LogOut
} from 'lucide-react';
import { Procurement, ViewType, ProcurementStatus, User } from './types';
import { storageService } from './services/storageService';
import { excelService } from './services/excelService';
import { MANDATORY_DOCS } from './constants';
import Dashboard from './components/Dashboard';
import ProcurementTable from './components/ProcurementTable';
import ProcurementForm from './components/ProcurementForm';
import Login from './components/Login';

const AUTH_KEY = 'procureflow_auth';

const App: React.FC = () => {
  const [data, setData] = useState<Procurement[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<Procurement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    storageService.seedInitialData();
    setData(storageService.getData());
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      setCurrentUser(null);
      localStorage.removeItem(AUTH_KEY);
    }
  };

  const handleUpdateData = (newData: Procurement[]) => {
    setData(newData);
    storageService.saveData(newData);
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (activeView === 'pending') {
      result = result.filter(item => item.status !== ProcurementStatus.Payment_Completed);
    } else if (activeView === 'completed') {
      result = result.filter(item => item.status === ProcurementStatus.Payment_Completed);
    } else if (activeView === 'missing-docs') {
      result = result.filter(item => {
        return MANDATORY_DOCS.some(doc => item.documents[doc]?.checked !== true);
      });
    } else if (activeView === 'ready-to-close') {
      result = result.filter(item => {
        const hasAllDocs = MANDATORY_DOCS.every(doc => item.documents[doc]?.checked === true);
        return item.status === ProcurementStatus.Delivery && hasAllDocs;
      });
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.supplierName.toLowerCase().includes(q) || 
        item.prNumber.toLowerCase().includes(q) ||
        item.poNumber.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [data, activeView, searchQuery]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Procurement) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this procurement record?')) {
      const newData = data.filter(item => item.id !== id);
      handleUpdateData(newData);
      if (isFormOpen) setIsFormOpen(false);
    }
  };

  const handleSaveItem = (item: Procurement) => {
    const exists = data.find(i => i.id === item.id);
    let newData;
    if (exists) {
      newData = data.map(i => i.id === item.id ? item : i);
    } else {
      newData = [...data, item];
    }
    handleUpdateData(newData);
    setIsFormOpen(false);
  };

  const handleExport = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }
    excelService.exportToExcel(data);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      const imported = await excelService.importFromExcel(file);
      if (confirm(`Detected ${imported.length} records. Merge into existing data? (Imported items will be assigned to your account)`)) {
        const existingRecordIds = new Set(data.map(i => i.recordId));
        
        // Assign imported records to current user
        const newItems = imported.map(item => ({
          ...item,
          createdBy: currentUser.username,
          createdByUsername: currentUser.username,
          lastUpdated: new Date().toISOString()
        })).filter(i => !existingRecordIds.has(i.recordId));

        if (newItems.length === 0) {
          alert("All records in this file already exist in the registry.");
          return;
        }

        const updatedData = [...data, ...newItems];
        handleUpdateData(updatedData);
        alert(`Successfully imported ${newItems.length} records to your account list.`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed.");
    } finally {
      e.target.value = '';
    }
  };

  // Auth Guard
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const getInitials = (name: string) => {
    if (!name) return "PF";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={importInputRef} 
        onChange={handleImportFile} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out border-r border-slate-200 bg-white flex flex-col shrink-0 relative z-20`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between h-16 shrink-0">
          <div className={`flex items-center gap-2 font-bold text-blue-600 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            <Database className="w-6 h-6 shrink-0" />
            <span className="text-xl">ProcureFlow</span>
          </div>
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('dashboard')}
          />
          <NavItem 
            icon={<List size={20} />} 
            label="All Records" 
            active={activeView === 'all'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('all')}
          />
          <div className="pt-4 pb-2">
            <span className={`px-4 text-xs font-semibold text-slate-400 uppercase ${!isSidebarOpen && 'hidden'}`}>Account Views</span>
          </div>
          <NavItem 
            icon={<UserIcon size={20} />} 
            label="My Account List" 
            active={activeView === 'by-admin'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('by-admin')}
          />
          <NavItem 
            icon={<Clock size={20} />} 
            label="Pending" 
            active={activeView === 'pending'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('pending')}
          />
          <NavItem 
            icon={<CheckCircle2 size={20} />} 
            label="Completed" 
            active={activeView === 'completed'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('completed')}
          />
          <div className="pt-4 pb-2">
            <span className={`px-4 text-xs font-semibold text-slate-400 uppercase ${!isSidebarOpen && 'hidden'}`}>Categorization</span>
          </div>
          <NavItem 
            icon={<Building2 size={20} />} 
            label="By Supplier" 
            active={activeView === 'by-supplier'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('by-supplier')}
          />
          <NavItem 
            icon={<Tags size={20} />} 
            label="By Category" 
            active={activeView === 'by-category'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('by-category')}
          />
          <div className="pt-4 pb-2">
            <span className={`px-4 text-xs font-semibold text-slate-400 uppercase ${!isSidebarOpen && 'hidden'}`}>Alerts</span>
          </div>
          <NavItem 
            icon={<FileWarning size={20} className="text-amber-500" />} 
            label="Missing Docs" 
            active={activeView === 'missing-docs'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('missing-docs')}
          />
          <NavItem 
            icon={<PartyPopper size={20} className="text-green-500" />} 
            label="Ready to Close" 
            active={activeView === 'ready-to-close'} 
            expanded={isSidebarOpen}
            onClick={() => setActiveView('ready-to-close')}
          />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-slate-200`}>
              {getInitials(currentUser.username)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-slate-800">{currentUser.username}</p>
                <p className="text-xs text-slate-400 truncate">Procurement Officer</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search PR, PO, Category or Supplier..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={handleImportClick}
                className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 border-r border-slate-200 transition-colors group"
                title="Import Excel to My List"
              >
                <Upload size={18} className="group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-medium hidden lg:inline">Import</span>
              </button>
              <button 
                onClick={handleExport}
                className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 transition-colors group"
                title="Export Entire Registry"
              >
                <Download size={18} className="group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-medium hidden lg:inline">Export</span>
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <button 
              onClick={openAddForm}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New Request</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {activeView === 'dashboard' ? (
              <Dashboard data={data} onViewAll={() => setActiveView('all')} />
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 capitalize leading-tight">
                      {activeView === 'by-admin' ? `Designated Account: ${currentUser.username}` : activeView.replace('-', ' ')}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Viewing {filteredData.length} total records</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {filteredData.length} records
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <ProcurementTable 
                    data={filteredData} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    groupMode={
                      activeView === 'by-supplier' ? 'supplier' : 
                      activeView === 'by-admin' ? 'admin' : 
                      activeView === 'by-category' ? 'category' : undefined
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isFormOpen && (
        <ProcurementForm 
          item={editingItem} 
          currentUser={currentUser}
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveItem}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, expanded, onClick, className = '' }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group
      ${active 
        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      ${className}
    `}
  >
    <div className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
      {icon}
    </div>
    {expanded && <span className="text-sm truncate">{label}</span>}
    {active && expanded && <div className="ml-auto w-1.5 h-1.5 bg-white/50 rounded-full"></div>}
  </button>
);

export default App;
