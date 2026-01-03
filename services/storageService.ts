
import { Procurement, DocumentEntry, StationStatus } from '../types';

const STORAGE_KEY = 'procureflow_data';

const emptyDoc = (): DocumentEntry => ({ checked: false, file: null });
const emptyStation = (): StationStatus => ({ status: 'pending' });

export const storageService = {
  getData: (): Procurement[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveData: (data: Procurement[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  seedInitialData: () => {
    const existing = storageService.getData();
    if (existing.length === 0) {
      const mockData: Procurement[] = [
        {
          id: '1',
          recordId: 1001,
          supplierName: 'Office Depot',
          category: 'Office Supplies',
          prNumber: 'PR-2023-001',
          poNumber: 'PO-2023-001',
          amount: 1500.00,
          poAmount: 1450.00,
          status: 'Requested' as any,
          createdBy: 'Alice Smith',
          dateRequested: '2023-10-01',
          lastUpdated: new Date().toISOString(),
          notes: 'Initial office supplies',
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
            cmo: { status: 'processing', receivedDate: '2023-10-02' },
            it: { status: 'na' },
            budget: emptyStation(),
            gso: emptyStation(),
            bac: emptyStation(),
            po: emptyStation(),
            delivery: emptyStation(),
            accounting: emptyStation(),
            treasury: emptyStation()
          }
        }
      ];
      storageService.saveData(mockData);
    }
  }
};
