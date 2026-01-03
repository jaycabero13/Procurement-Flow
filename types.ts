
export enum ProcurementStatus {
  Requested = 'Requested',
  CMO_Approval = 'CMO Approval',
  IT_Review = 'IT Review',
  Budget_Office = 'Budget Office',
  GSO_PR = 'GSO - PR Generation',
  BAC_Bidding = 'BAC - Bidding',
  PO_Release = 'PO Release',
  Delivery = 'Delivery',
  Accounting = 'Accounting Verification',
  Payment_Completed = 'Payment Completed'
}

export type ProcurementCategory = 
  | 'Office Supplies'
  | 'Other Supplies'
  | 'Repair & Maintenance - ICT'
  | 'Repair & Maintenance - Motor Vehicle'
  | 'Repair & Maintenance - Office Equipment'
  | 'Continuing Appropriation'
  | 'Capital Outlay'
  | 'Representation Expenses'
  | 'Training Expenses'
  | 'Meals and Snacks';

export interface User {
  id: string;
  username: string;
  password?: string;
  avatarColor: string;
}

export interface ProcurementFile {
  name: string;
  type: string;
  size: number;
  data: string;
  uploadedAt: string;
}

export interface DocumentEntry {
  checked: boolean;
  file: ProcurementFile | null;
}

export interface DocumentChecklist {
  omnibus: DocumentEntry;
  canvass: DocumentEntry;
  obr: DocumentEntry;
  soa: DocumentEntry;
  ris: DocumentEntry;
  wasteMaterialReport: DocumentEntry;
  acceptanceReport: DocumentEntry;
  inspectionReport: DocumentEntry;
}

export interface StationStatus {
  receivedDate?: string;
  releasedDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'na';
}

export interface Procurement {
  id: string;
  recordId: number;
  supplierName: string;
  category: ProcurementCategory;
  prNumber: string;
  poNumber: string;
  amount: number;
  poAmount: number;
  status: ProcurementStatus;
  createdBy: string;
  createdByUsername?: string;
  dateRequested: string;
  dateCompleted?: string;
  lastUpdated: string;
  notes: string;
  documents: DocumentChecklist;
  eventDate?: string;
  venueLocation?: string;
  servings?: string;
  mealSchedule?: {
    amSnack: boolean;
    lunch: boolean;
    pmSnack: boolean;
    dinner: boolean;
  };
  workflow: {
    cmo: StationStatus;
    it: StationStatus;
    budget: StationStatus;
    gso: StationStatus;
    bac: StationStatus;
    po: StationStatus;
    delivery: StationStatus;
    accounting: StationStatus;
    treasury: StationStatus;
  };
}

export type ViewType = 
  | 'all' 
  | 'pending' 
  | 'completed' 
  | 'by-supplier' 
  | 'by-admin' 
  | 'by-category'
  | 'missing-docs' 
  | 'ready-to-close'
  | 'dashboard'
  | 'workflow-map';
