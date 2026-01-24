
import React, { useMemo } from 'react';
import { 
  ChevronRight, 
  Map as MapIcon, 
  Circle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Procurement, ProcurementStatus } from '../types';
import { OFFICE_STEPS, CATEGORY_CONFIG } from '../constants';

interface WorkflowMapProps {
  data: Procurement[];
  onEdit: (item: Procurement) => void;
}

const WorkflowMap: React.FC<WorkflowMapProps> = ({ data, onEdit }) => {
  const stationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    OFFICE_STEPS.forEach(step => {
      counts[step.id] = data.filter(item => 
        item.workflow![step.id as keyof Procurement['workflow']]?.status === 'processing'
      ).length;
    });
    return counts;
  }, [data]);

  const getItemsAtStation = (stationId: string) => {
    return data.filter(item => 
      item.workflow![stationId as keyof Procurement['workflow']]?.status === 'processing'
    ).slice(0, 3);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MapIcon size={32} className="text-blue-600" />
            Workflow Connectivity Map
          </h1>
          <p className="text-slate-500 text-sm font-medium">Visualizing the real-time location of all procurement requests.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <LegendItem icon={<Circle size={12} className="text-slate-200 fill-slate-200" />} label="Idle Station" />
          <LegendItem icon={<div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />} label="Active Hold" />
          <LegendItem icon={<CheckCircle2 size={12} className="text-green-500" />} label="Step Completed" />
        </div>
      </div>

      <div className="relative">
        {/* Connection Line Background */}
        <div className="absolute top-[120px] left-10 right-10 h-1 bg-slate-100 hidden xl:block z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 relative z-10">
          {OFFICE_STEPS.map((step, idx) => {
            const count = stationCounts[step.id] || 0;
            const items = getItemsAtStation(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col gap-4">
                <div className={`
                  relative bg-white rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden
                  ${count > 0 ? 'border-blue-500 shadow-2xl shadow-blue-100 scale-105' : 'border-slate-100 hover:border-slate-200 shadow-sm'}
                `}>
                  {/* Step Indicator */}
                  <div className={`absolute top-4 right-4 text-[10px] font-black px-2 py-1 rounded-lg ${count > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    STEP {idx + 1}
                  </div>

                  <div className="p-8">
                    <div className={`
                      w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all duration-500
                      ${count > 0 ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-8 ring-blue-50 rotate-3' : 'bg-slate-50 text-slate-300'}
                    `}>
                      <Icon size={32} />
                    </div>

                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">{step.label}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Municipal Station</p>

                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hold Count</span>
                        <span className={`text-2xl font-black ${count > 0 ? 'text-blue-600' : 'text-slate-300'}`}>{count}</span>
                      </div>
                      
                      {count > 0 && (
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(count, 3))].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600">
                              #{i+1}
                            </div>
                          ))}
                          {count > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                              +{count - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Peeking */}
                  {count > 0 && (
                    <div className="bg-blue-50/50 p-4 space-y-2">
                      {items.map(item => (
                        <button 
                          key={item.id}
                          onClick={() => onEdit(item)}
                          className="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-blue-100 hover:border-blue-300 transition-all text-left group/btn"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-900 truncate">{item.supplierName}</p>
                            <p className="text-[8px] font-bold text-slate-400 truncate">ID: {item.recordId}</p>
                          </div>
                          <ChevronRight size={14} className="text-blue-300 group-hover/btn:text-blue-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Visual Arrow for Flow */}
                {idx < OFFICE_STEPS.length - 1 && (
                  <div className="flex justify-center xl:hidden text-slate-200">
                    <ArrowRight size={24} className="rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-3">
    {icon}
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

export default WorkflowMap;
