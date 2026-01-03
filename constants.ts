
import { ProcurementStatus, ProcurementCategory } from './types';
import { 
  Printer, 
  Package, 
  Laptop, 
  Car, 
  Wrench, 
  Clock, 
  Building2,
  ShieldCheck,
  Cpu,
  Calculator,
  FileText,
  Users,
  Truck,
  CreditCard,
  Banknote,
  Send,
  Coffee,
  GraduationCap,
  Utensils
} from 'lucide-react';

export const STATUS_OPTIONS = Object.values(ProcurementStatus);

export const CATEGORY_OPTIONS: ProcurementCategory[] = [
  'Office Supplies',
  'Other Supplies',
  'Repair & Maintenance - ICT',
  'Repair & Maintenance - Motor Vehicle',
  'Repair & Maintenance - Office Equipment',
  'Continuing Appropriation',
  'Capital Outlay',
  'Representation Expenses',
  'Training Expenses',
  'Meals and Snacks'
];

export const OFFICE_STEPS = [
  { id: 'cmo', label: 'CMO Approval', icon: ShieldCheck, status: ProcurementStatus.CMO_Approval },
  { id: 'it', label: 'IT Review', icon: Cpu, status: ProcurementStatus.IT_Review, conditional: true },
  { id: 'budget', label: 'Budget Office', icon: Calculator, status: ProcurementStatus.Budget_Office },
  { id: 'gso', label: 'GSO - PR Generation', icon: Send, status: ProcurementStatus.GSO_PR },
  { id: 'bac', label: 'BAC Bidding', icon: Users, status: ProcurementStatus.BAC_Bidding },
  { id: 'po', label: 'PO Release', icon: FileText, status: ProcurementStatus.PO_Release },
  { id: 'delivery', label: 'Motorpool', icon: Truck, status: ProcurementStatus.Delivery },
  { id: 'accounting', label: 'Accounting Verification', icon: CreditCard, status: ProcurementStatus.Accounting },
  { id: 'treasury', label: 'Treasury Payment', icon: Banknote, status: ProcurementStatus.Payment_Completed }
];

export const CATEGORY_CONFIG: Record<ProcurementCategory, { icon: any, color: string, bgColor: string }> = {
  'Office Supplies': { icon: Printer, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'Other Supplies': { icon: Package, color: 'text-slate-600', bgColor: 'bg-slate-50' },
  'Repair & Maintenance - ICT': { icon: Laptop, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'Repair & Maintenance - Motor Vehicle': { icon: Car, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  'Repair & Maintenance - Office Equipment': { icon: Wrench, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'Continuing Appropriation': { icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'Capital Outlay': { icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  'Representation Expenses': { icon: Coffee, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  'Training Expenses': { icon: GraduationCap, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  'Meals and Snacks': { icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50' }
};

export const MANDATORY_DOCS: (keyof import('./types').DocumentChecklist)[] = [
  'omnibus',
  'canvass',
  'obr',
  'soa',
  'ris',
  'acceptanceReport',
  'inspectionReport'
];

export const DOC_LABELS: Record<keyof import('./types').DocumentChecklist, string> = {
  omnibus: 'Omnibus Sworn Statement',
  canvass: 'Abstract of Canvass',
  obr: 'Obligation Request (OBR)',
  soa: 'Statement of Account (SOA)',
  ris: 'Requisition & Issue Slip (RIS)',
  wasteMaterialReport: 'Waste Material Report (Optional)',
  acceptanceReport: 'Acceptance Report',
  inspectionReport: 'Inspection Report'
};

export const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-emerald-500'
];
