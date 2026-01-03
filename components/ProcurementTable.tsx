
import React from 'react';
import { Edit3, Trash2, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { Procurement, ProcurementStatus } from '../types';
import { MANDATORY_DOCS, CATEGORY_CONFIG, OFFICE_STEPS } from '../constants';

interface ProcurementTableProps {
  data: Procurement[];
  onEdit: (item: Procurement) => void;
  onDelete: (id: string) => void;
  groupMode?: 'supplier' | 'admin' | 'category';
}

const ProcurementTable: React.FC<ProcurementTableProps> = ({ data, onEdit, onDelete }) => {
  if (data.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100">
          <FileText size={48} className="text-slate-200" />
        </div>
        <p className="text-xl font-black text-slate-400 tracking-tight">No active requests found.</p>
        <p className="text-sm text-slate-300 mt-2 font-medium">Create a new registry to begin the workflow.</p>
      </div>
    );
  }

  const getCurrentStation = (item: Procurement) => {
    const steps = OFFICE_STEPS;
    const current = steps.find(s => item.workflow![s.id as keyof Procurement['workflow']]?.status === 'processing');
    if (current) return { ...current, isProcessing: true };
    
    // If none processing, find last completed
    const reversed = [...steps].reverse();
    const lastDone = reversed.find(s => item.workflow![s.id as keyof Procurement['workflow']]?.status === 'completed');
    return lastDone ? { ...lastDone, isProcessing: false } : { label: 'Staff Request Initiation', icon: FileText, id: 'start', isProcessing: false };
  };

  const isChecklistComplete = (item: Procurement) => {
    return MANDATORY_DOCS.every(doc => item.documents[doc]?.checked === true);
  };

  const renderRow = (item: Procurement) => {
    const station = getCurrentStation(item);
    const StationIcon = station.icon;
    const categoryCfg = CATEGORY_CONFIG[item.category];

    return (
      <tr key={item.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
        <td className="px-8 py-7">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-xl w-fit shadow-sm">#{item.recordId}</div>
        </td>
        <td className="px-8 py-7">
          <div className="font-black text-slate-900 text-sm leading-tight mb-2">{item.supplierName}</div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl w-fit ${categoryCfg.bgColor} ${categoryCfg.color} border border-transparent hover:border-current transition-all cursor-default`}>
            <categoryCfg.icon size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.category}</span>
          </div>
        </td>
        <td className="px-8 py-7">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              {item.prNumber ? (
                <div className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase w-fit">PR: {item.prNumber}</div>
              ) : (
                <div className="text-[8px] font-bold text-slate-300 italic">PR Pending...</div>
              )}
              {item.amount > 0 && (
                <div className="text-[10px] font-black text-slate-800">₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
              )}
            </div>
            
            {(item.poNumber || (item.poAmount && item.poAmount > 0)) && (
              <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-50">
                {item.poNumber && (
                  <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase w-fit">PO: {item.poNumber}</div>
                )}
                {item.poAmount && item.poAmount > 0 && (
                  <div className="text-[10px] font-black text-emerald-800">₱{item.poAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                )}
              </div>
            )}
          </div>
        </td>
        <td className="px-8 py-7">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-xl transition-all duration-500 ${station.isProcessing ? 'bg-blue-600 text-white shadow-blue-100 animate-pulse' : 'bg-slate-100 text-slate-400 shadow-slate-50'}`}>
              <StationIcon size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Station Hold</p>
              <p className="text-xs font-black text-slate-900 leading-none">{station.label}</p>
            </div>
          </div>
        </td>
        <td className="px-8 py-7">
          <div className="flex items-center gap-1.5">
            {OFFICE_STEPS.map((s, idx) => {
              const st = item.workflow![s.id as keyof Procurement['workflow']];
              return (
                <div 
                  key={s.id} 
                  title={`${s.label}: ${st.status.toUpperCase()}`}
                  className={`h-2.5 w-6 rounded-full transition-all duration-500 ${
                    st.status === 'completed' ? 'bg-green-500' : 
                    st.status === 'processing' ? 'bg-blue-600 animate-pulse w-10' : 
                    st.status === 'na' ? 'bg-slate-50' : 
                    'bg-slate-100'
                  }`} 
                />
              )
            })}
          </div>
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">Workflow Journey</p>
        </td>
        <td className="px-8 py-7">
          <div className="flex items-center gap-2">
            {isChecklistComplete(item) ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50">
                <CheckCircle size={12} className="shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">Compliant</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-1.5 rounded-2xl border border-rose-100 shadow-sm shadow-rose-50">
                <AlertCircle size={12} className="shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest">Deficient</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-8 py-7 text-right">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all justify-end translate-x-4 group-hover:translate-x-0">
            <button 
              onClick={() => onEdit(item)} 
              className="p-3 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-lg shadow-slate-50 active:scale-90"
              title="Edit Workflow"
            >
              <Edit3 size={18} />
            </button>
            <button 
              onClick={() => onDelete(item.id)} 
              className="p-3 bg-white border border-slate-200 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-rose-50 active:scale-90"
              title="Delete Record"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto h-full custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead className="sticky top-0 bg-white z-20">
          <tr className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
            <th className="px-8 py-8">Ref ID</th>
            <th className="px-8 py-8">Payee & Purpose</th>
            <th className="px-8 py-8">Financial / PR & PO</th>
            <th className="px-8 py-8">Status Station</th>
            <th className="px-8 py-8">Workflow Journey</th>
            <th className="px-8 py-8">Compliance</th>
            <th className="px-8 py-8 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {data.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
};

export default ProcurementTable;
