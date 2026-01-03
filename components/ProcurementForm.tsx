
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Upload, Trash2, Hash, CreditCard, Banknote, 
  Calendar, ClipboardList, MapPin, Users, Coffee, AlertTriangle, 
  FileDown, FileSpreadsheet, Printer 
} from 'lucide-react';
import { Procurement, ProcurementStatus, DocumentChecklist, ProcurementFile, ProcurementCategory, User, DocumentEntry, StationStatus } from '../types';
import { STATUS_OPTIONS, DOC_LABELS, MANDATORY_DOCS, CATEGORY_OPTIONS, OFFICE_STEPS } from '../constants';
import { excelService } from '../services/excelService';
import { jsPDF } from 'jspdf';

interface ProcurementFormProps {
  item: Procurement | null;
  currentUser: User;
  onClose: () => void;
  onSave: (item: Procurement) => void;
  onDelete: (id: string) => void;
}

const emptyDoc = (): DocumentEntry => ({ checked: false, file: null });
const emptyStation = (): StationStatus => ({ status: 'pending' });

const ProcurementForm: React.FC<ProcurementFormProps> = ({ item, currentUser, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Procurement>>({
    supplierName: '',
    category: CATEGORY_OPTIONS[0],
    prNumber: '',
    poNumber: '',
    amount: undefined,
    poAmount: undefined,
    status: ProcurementStatus.Requested,
    createdBy: currentUser.username,
    createdByUsername: currentUser.username,
    notes: '',
    dateRequested: new Date().toISOString().split('T')[0],
    eventDate: '',
    venueLocation: '',
    servings: '',
    mealSchedule: {
      amSnack: false,
      lunch: false,
      pmSnack: false,
      dinner: false
    },
    documents: {
      omnibus: emptyDoc(),
      canvass: emptyDoc(),
      obr: emptyDoc(),
      soa: emptyDoc(),
      ris: emptyDoc(),
      wasteMaterialReport: emptyDoc(),
      acceptanceReport: emptyDoc(),
      inspectionReport: emptyDoc()
    },
    workflow: {
      cmo: emptyStation(),
      it: emptyStation(),
      budget: emptyStation(),
      gso: emptyStation(),
      bac: emptyStation(),
      po: emptyStation(),
      delivery: emptyStation(),
      accounting: emptyStation(),
      treasury: emptyStation()
    }
  });

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocKey, setActiveDocKey] = useState<keyof DocumentChecklist | null>(null);

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  useEffect(() => {
    const isITItem = formData.category === 'Repair & Maintenance - ICT' || formData.category === 'Capital Outlay';
    const currentITStatus = formData.workflow?.it?.status;
    
    if (!isITItem && currentITStatus !== 'na') {
      updateStation('it', 'status', 'na');
    } else if (isITItem && currentITStatus === 'na') {
      updateStation('it', 'status', 'pending');
    }
  }, [formData.category]);

  const updateStation = (id: string, field: keyof StationStatus, value: any) => {
    setFormData(prev => ({
      ...prev,
      workflow: {
        ...prev.workflow!,
        [id]: {
          ...prev.workflow![id as keyof Procurement['workflow']],
          [field]: value
        }
      }
    }));
  };

  const toggleCheck = (docKey: keyof DocumentChecklist) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents!,
        [docKey]: {
          ...prev.documents![docKey],
          checked: !prev.documents![docKey].checked
        }
      }
    }));
  };

  const updateMealSchedule = (meal: keyof NonNullable<Procurement['mealSchedule']>) => {
    setFormData(prev => ({
      ...prev,
      mealSchedule: {
        ...prev.mealSchedule!,
        [meal]: !prev.mealSchedule![meal]
      }
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocKey) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const procurementFile: ProcurementFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64String,
        uploadedAt: new Date().toISOString()
      };

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents!,
          [activeDocKey]: {
            ...prev.documents![activeDocKey],
            file: procurementFile,
            checked: true
          }
        }
      }));
      setActiveDocKey(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (docKey: keyof DocumentChecklist) => {
    setActiveDocKey(docKey);
    fileInputRef.current?.click();
  };

  const downloadFile = (docKey: keyof DocumentChecklist) => {
    const file = formData.documents?.[docKey]?.file;
    if (!file) return;

    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!formData.recordId) return;
    const doc = new jsPDF();
    const primaryColor = '#2563eb';
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('ProcureFlow PMS', 10, 20);
    doc.setFontSize(10);
    doc.text(`REGISTRY ID: #${formData.recordId}`, 10, 30);
    doc.text(`LAST UPDATED: ${new Date(formData.lastUpdated || '').toLocaleString()}`, 140, 30);

    // Body
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text('Registry Summary', 10, 50);
    doc.setDrawColor(226, 232, 240);
    doc.line(10, 52, 200, 52);

    doc.setFontSize(10);
    let y = 60;
    const col1 = 15;
    const col2 = 65;

    const addRow = (label: string, value: any) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, col1, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value || '---'), col2, y);
      y += 8;
    };

    addRow('Supplier / Payee:', formData.supplierName);
    addRow('Category:', formData.category);
    addRow('PR Number:', formData.prNumber || 'N/A');
    addRow('PR Amount:', formData.amount ? `PHP ${Number(formData.amount).toLocaleString()}` : '---');
    addRow('PO Number:', formData.poNumber || 'N/A');
    addRow('PO Amount:', formData.poAmount ? `PHP ${Number(formData.poAmount).toLocaleString()}` : '---');
    addRow('Status:', formData.status);
    addRow('Requested By:', formData.createdBy);
    addRow('Date Requested:', formData.dateRequested);

    if (formData.category === 'Meals and Snacks') {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Event Details', 10, y);
      y += 8;
      addRow('Event Date:', formData.eventDate);
      addRow('Venue:', formData.venueLocation);
      addRow('Total Servings:', formData.servings);
      const meals = [];
      if (formData.mealSchedule?.amSnack) meals.push('AM');
      if (formData.mealSchedule?.lunch) meals.push('LUNCH');
      if (formData.mealSchedule?.pmSnack) meals.push('PM');
      if (formData.mealSchedule?.dinner) meals.push('DINNER');
      addRow('Schedule:', meals.length ? meals.join(', ') : 'None selected');
    }

    y += 10;
    doc.setFontSize(14);
    doc.text('Compliance Checklist', 10, y);
    doc.line(10, y + 2, 200, y + 2);
    y += 10;

    doc.setFontSize(9);
    Object.entries(formData.documents!).forEach(([key, value]) => {
      const label = DOC_LABELS[key as keyof DocumentChecklist];
      doc.setFont('helvetica', value.checked ? 'bold' : 'normal');
      doc.text(value.checked ? '[X]' : '[ ]', 15, y);
      doc.text(label, 25, y);
      if (value.file) {
        doc.setTextColor(100, 116, 139);
        doc.text(`(File: ${value.file.name})`, 105, y);
        doc.setTextColor(30, 41, 59);
      }
      y += 8;
    });

    doc.save(`Procurement_Registry_${formData.recordId}.pdf`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName) {
      setError("Supplier / Payee name is required.");
      return;
    }

    const payload: Procurement = {
      ...formData as Procurement,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      recordId: formData.recordId || Math.floor(Math.random() * 9000) + 1000,
      amount: formData.amount || 0,
      poAmount: formData.poAmount || 0,
      dateRequested: formData.dateRequested || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
      
      <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 ring-4 ring-blue-50">
              <ClipboardList size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Process Registry</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Registry ID: {formData.recordId || 'New'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 mr-4">
                <button 
                  type="button"
                  onClick={() => excelService.exportSingleRecord(item)}
                  className="p-2.5 hover:bg-white rounded-xl text-slate-500 hover:text-emerald-600 transition-all group flex items-center gap-2"
                  title="Download Record as Excel"
                >
                  <FileSpreadsheet size={18} />
                  <span className="text-[10px] font-black uppercase">Excel</span>
                </button>
                <button 
                  type="button"
                  onClick={exportPDF}
                  className="p-2.5 hover:bg-white rounded-xl text-slate-500 hover:text-rose-600 transition-all group flex items-center gap-2"
                  title="Download Record as PDF"
                >
                  <FileDown size={18} />
                  <span className="text-[10px] font-black uppercase">PDF</span>
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all hover:rotate-90">
              <X size={28} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 bg-slate-50/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <HighlightInput label="PR Number" icon={Hash} placeholder="PR Number" value={formData.prNumber} onChange={val => setFormData({...formData, prNumber: val})} />
                  <HighlightInput label="PR Amount (₱)" icon={Banknote} placeholder="Enter Amount" type="number" value={formData.amount} onChange={val => setFormData({...formData, amount: parseFloat(val) || undefined})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <HighlightInput label="PO Number" icon={CreditCard} placeholder="PO Number" value={formData.poNumber} onChange={val => setFormData({...formData, poNumber: val})} />
                  <HighlightInput label="PO Amount (₱)" icon={Banknote} placeholder="Enter Amount" type="number" value={formData.poAmount} onChange={val => setFormData({...formData, poAmount: parseFloat(val) || undefined})} />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <SectionTitle title="Basic Information" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Supplier / Payee">
                    <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} />
                  </InputGroup>
                  <InputGroup label="Category">
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </InputGroup>
                  <InputGroup label="Date of Request">
                    <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.dateRequested} onChange={e => setFormData({...formData, dateRequested: e.target.value})} />
                  </InputGroup>
                </div>
              </div>

              {formData.category === 'Meals and Snacks' && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-200 bg-orange-50/10 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <SectionTitle title="Event Details (Meals & Snacks)" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputGroup label="Date of Event">
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                        <input type="date" className="w-full pl-11 pr-5 py-3 bg-white border border-orange-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                      </div>
                    </InputGroup>
                    <InputGroup label="Venue / Location">
                      <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                        <input className="w-full pl-11 pr-5 py-3 bg-white border border-orange-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="Location..." value={formData.venueLocation} onChange={e => setFormData({...formData, venueLocation: e.target.value})} />
                      </div>
                    </InputGroup>
                    <InputGroup label="Total Serving">
                      <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                        <input className="w-full pl-11 pr-5 py-3 bg-white border border-orange-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 50 Pax" value={formData.servings} onChange={e => setFormData({...formData, servings: e.target.value})} />
                      </div>
                    </InputGroup>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Coffee size={14} className="text-orange-500" /> Meal Schedule
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MealToggle label="AM Snack" active={formData.mealSchedule?.amSnack} onToggle={() => updateMealSchedule('amSnack')} />
                      <MealToggle label="Lunch" active={formData.mealSchedule?.lunch} onToggle={() => updateMealSchedule('lunch')} />
                      <MealToggle label="PM Snack" active={formData.mealSchedule?.pmSnack} onToggle={() => updateMealSchedule('pmSnack')} />
                      <MealToggle label="Dinner" active={formData.mealSchedule?.dinner} onToggle={() => updateMealSchedule('dinner')} />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <SectionTitle title="Compliance Documents" />
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(formData.documents!) as (keyof DocumentChecklist)[]).map(docKey => (
                    <div key={docKey} className={`flex items-center gap-3 p-4 rounded-2xl border ${formData.documents![docKey].checked ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50/50 border-slate-100'}`}>
                      <input type="checkbox" checked={formData.documents![docKey].checked} onChange={() => toggleCheck(docKey)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <span className={`text-[11px] font-black uppercase flex-1 truncate ${formData.documents![docKey].checked ? 'text-blue-900' : 'text-slate-500'}`}>{DOC_LABELS[docKey].split(' (')[0]}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => triggerUpload(docKey)} className={`p-2 rounded-xl transition-colors ${formData.documents![docKey].file ? 'text-blue-600 bg-white shadow-sm border border-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}>
                          <Upload size={14} />
                        </button>
                        {formData.documents![docKey].file && (
                          <button type="button" onClick={() => downloadFile(docKey)} className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors" title="Download Document">
                            <FileDown size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Calendar size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Office Station Logs</h3>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/20">
                <div className="relative pl-8 border-l-2 border-slate-100 space-y-10">
                  {OFFICE_STEPS.map((step) => {
                    const statusData = formData.workflow![step.id as keyof Procurement['workflow']];
                    const isNA = statusData.status === 'na';
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className={`relative ${isNA ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className={`absolute -left-[41px] p-2 rounded-xl border-4 border-white shadow-md z-10 ${
                          statusData.status === 'completed' ? 'bg-green-500 text-white' : 
                          statusData.status === 'processing' ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 
                          'bg-slate-200 text-slate-400'
                        }`}>
                          <Icon size={16} />
                        </div>
                        
                        <div className={`p-4 rounded-[2rem] border ${
                          statusData.status === 'completed' ? 'bg-white border-green-100' :
                          statusData.status === 'processing' ? 'bg-white border-blue-100 shadow-lg' :
                          'bg-white border-slate-100'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-800">{step.label}</span>
                            <select 
                              disabled={isNA}
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg outline-none cursor-pointer ${
                                statusData.status === 'completed' ? 'bg-green-50 text-green-600' :
                                statusData.status === 'processing' ? 'bg-blue-600 text-white' :
                                'bg-slate-100 text-slate-500'
                              }`}
                              value={statusData.status}
                              onChange={e => updateStation(step.id, 'status', e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Current</option>
                              <option value="completed">Done</option>
                              {step.conditional && <option value="na">N/A</option>}
                            </select>
                          </div>

                          {!isNA && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Received</label>
                                <input type="date" className="w-full text-[10px] font-bold bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all" value={statusData.receivedDate || ''} onChange={e => updateStation(step.id, 'receivedDate', e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Released</label>
                                <input type="date" className="w-full text-[10px] font-bold bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all" value={statusData.receivedDate || ''} onChange={e => updateStation(step.id, 'releasedDate', e.target.value)} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-6 bg-red-50 border-2 border-red-100 text-red-600 rounded-[2rem] text-sm font-black flex items-center gap-4 animate-in slide-in-from-bottom-4">
              <AlertTriangle size={24} className="shrink-0" />
              {error}
            </div>
          )}
        </form>

        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            {item && <button type="button" onClick={() => onDelete(item.id)} className="px-6 py-4 rounded-2xl text-rose-500 font-black hover:bg-rose-50 transition-all uppercase tracking-widest text-[10px]">Delete Record</button>}
            <button onClick={onClose} className="px-8 py-4 rounded-2xl text-slate-400 font-black hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]">Discard</button>
            <button onClick={handleSubmit} className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest text-[10px]">Commit Workflow</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HighlightInput: React.FC<{ label: string, icon: any, placeholder: string, type?: string, value: any, onChange: (val: string) => void }> = ({ label, icon: Icon, placeholder, type = "text", value, onChange }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
      <Icon size={12} /> {label}
    </div>
    <input 
      type={type}
      className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-800 placeholder:text-slate-200 outline-none uppercase font-mono tracking-tighter"
      placeholder={placeholder}
      value={value === undefined || value === 0 ? '' : value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const MealToggle: React.FC<{ label: string, active: boolean | undefined, onToggle: () => void }> = ({ label, active, onToggle }) => (
  <button 
    type="button" 
    onClick={onToggle}
    className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
      active 
        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' 
        : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200'
    }`}
  >
    {label}
  </button>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-4 border-b border-slate-50 pb-3">{title}</h3>
);

const InputGroup: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

export default ProcurementForm;
