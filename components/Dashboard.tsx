
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { TrendingUp, Package, Clock, AlertTriangle, Layers, ChevronRight, ArrowRight } from 'lucide-react';
import { Procurement, ProcurementStatus } from '../types';
import { MANDATORY_DOCS, OFFICE_STEPS } from '../constants';

interface DashboardProps {
  data: Procurement[];
  onViewAll: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onViewAll }) => {
  const stats = useMemo(() => {
    const total = data.length;
    const totalAmount = data.reduce((acc, curr) => acc + curr.amount, 0);
    const missingDocs = data.filter(i => MANDATORY_DOCS.some(doc => i.documents[doc]?.checked !== true)).length;
    
    // Workflow Pipeline Stats
    const pipeline: Record<string, number> = {};
    OFFICE_STEPS.forEach(s => {
      pipeline[s.label] = data.filter(item => item.workflow![s.id as keyof Procurement['workflow']]?.status === 'processing').length;
    });

    return { total, totalAmount, missingDocs, pipeline };
  }, [data]);

  // Explicitly type pipelineData to ensure 'value' is treated as a number in the chart.
  // This fixes the error: Operator '>' cannot be applied to types 'unknown' and 'number'.
  const pipelineData: { name: string; value: number }[] = Object.entries(stats.pipeline).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workflow Hub</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time Station Intelligence & Request Lifecycle</p>
        </div>
        <button 
          onClick={onViewAll} 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          Manage Registry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Registry" value={stats.total} icon={<Package className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Total Value" value={`₱${stats.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Alerts" value={stats.missingDocs} icon={<AlertTriangle className="text-rose-600" />} color="bg-rose-50" subtitle="Records with missing files" />
      </div>

      {/* Visual Workflow Flowchart */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Operational Flowchart</h3>
              <p className="text-xs text-slate-400 font-medium">Tracking items through the 10-step municipal lifecycle</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Processing
             </div>
             <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <div className="w-2 h-2 rounded-full bg-slate-200"></div> Idle
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
          {OFFICE_STEPS.map((step, index) => {
            const count = stats.pipeline[step.label] || 0;
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex flex-col items-center">
                <div className={`
                  w-full p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center gap-3 group
                  ${count > 0 ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-50 scale-105 z-10' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:scale-105'}
                `}>
                  <div className={`p-3 rounded-2xl transition-all duration-500 ${count > 0 ? 'bg-blue-600 text-white ring-8 ring-blue-50' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${count > 0 ? 'text-blue-600' : 'text-slate-400'}`}>Step {index + 1}</p>
                    <p className="text-[11px] font-black text-slate-800 leading-tight h-8 flex items-center justify-center">{step.label}</p>
                  </div>
                  <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-black shadow-inner ${count > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                    {count}
                  </div>
                </div>
                {index < OFFICE_STEPS.length - 1 && (index + 1) % 5 !== 0 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-200">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Chart */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-blue-600 text-white rounded-2xl">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Bottleneck Analysis</h3>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}} 
                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={40}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#3b82f6' : '#f1f5f9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string, subtitle?: string }> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-start gap-6 group hover:shadow-xl hover:shadow-slate-100 transition-all">
    <div className={`p-5 rounded-[1.5rem] ${color} shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-500`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 truncate tracking-tight">{value}</h4>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{subtitle}</p>}
    </div>
  </div>
);

export default Dashboard;
