
import * as XLSX from 'xlsx';
import { Procurement, ProcurementStatus, ProcurementCategory, DocumentEntry, StationStatus } from '../types';
import { CATEGORY_OPTIONS, DOC_LABELS } from '../constants';

const COLUMNS = [
  'Record ID',
  'Supplier Name',
  'Category',
  'PR Number',
  'PO Number',
  'PR Amount (PHP)',
  'PO Amount (PHP)',
  'Status',
  'Created By',
  'Date Requested',
  'Date Completed',
  'Notes'
];

const emptyDoc = (): DocumentEntry => ({ checked: false, file: null });
const emptyStation = (): StationStatus => ({ status: 'pending' });

export const excelService = {
  exportToExcel: (data: Procurement[]) => {
    const worksheetData = data.map(item => ({
      'Record ID': item.recordId,
      'Supplier Name': item.supplierName,
      'Category': item.category,
      'PR Number': item.prNumber || '',
      'PO Number': item.poNumber || '',
      'PR Amount (PHP)': item.amount || '',
      'PO Amount (PHP)': item.poAmount || '',
      'Status': item.status,
      'Created By': item.createdBy,
      'Date Requested': item.dateRequested,
      'Date Completed': item.dateCompleted || '',
      'Notes': item.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Procurements');
    
    worksheet['!cols'] = COLUMNS.map(col => ({ wch: col.length + 10 }));

    XLSX.writeFile(workbook, `ProcureFlow_Registry_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportSingleRecord: (item: Procurement) => {
    const docStatus = Object.entries(item.documents).map(([key, value]) => ({
      'Document Type': DOC_LABELS[key as keyof typeof item.documents],
      'Status': value.checked ? 'COMPLETED' : 'PENDING',
      'Filename': value.file ? value.file.name : 'N/A'
    }));

    const mainData = [
      { 'Field': 'Record ID', 'Value': item.recordId },
      { 'Field': 'Supplier', 'Value': item.supplierName },
      { 'Field': 'Category', 'Value': item.category },
      { 'Field': 'PR Number', 'Value': item.prNumber || 'N/A' },
      { 'Field': 'PR Amount', 'Value': item.amount || '' },
      { 'Field': 'PO Number', 'Value': item.poNumber || 'N/A' },
      { 'Field': 'PO Amount', 'Value': item.poAmount || '' },
      { 'Field': 'Status', 'Value': item.status },
      { 'Field': 'Created By', 'Value': item.createdBy },
      { 'Field': 'Date Requested', 'Value': item.dateRequested },
      { 'Field': 'Notes', 'Value': item.notes }
    ];

    if (item.category === 'Meals and Snacks') {
      mainData.push(
        { 'Field': 'Event Date', 'Value': item.eventDate || 'N/A' },
        { 'Field': 'Venue', 'Value': item.venueLocation || 'N/A' },
        { 'Field': 'Servings', 'Value': item.servings || 'N/A' }
      );
    }

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(mainData);
    const ws2 = XLSX.utils.json_to_sheet(docStatus);
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Details');
    XLSX.utils.book_append_sheet(wb, ws2, 'Documents');

    XLSX.writeFile(wb, `Procurement_${item.recordId}_Details.xlsx`);
  },

  importFromExcel: async (file: File): Promise<Procurement[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const bstr = e.target?.result;
          const workbook = XLSX.read(bstr, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          const importedData: Procurement[] = jsonData.map((row, index) => {
            const itemType = row['Type'] || (row['Category'] === 'Repair & Maintenance - ICT' || row['Category'] === 'Capital Outlay' ? 'Technical' : 'Non-Technical');
            const isTechnical = itemType === 'Technical';

            return {
              id: Math.random().toString(36).substr(2, 9),
              recordId: row['Record ID'] || (Math.floor(Math.random() * 9000) + 1000),
              supplierName: row['Supplier Name'] || row['Item Name'] || 'Unknown Supplier',
              category: (row['Category'] as ProcurementCategory) || CATEGORY_OPTIONS[0],
              itemType: isTechnical ? 'Technical' : 'Non-Technical',
              prNumber: row['PR Number'] || '',
              poNumber: row['PO Number'] || '',
              amount: parseFloat(row['PR Amount (PHP)'] || row['Amount (PHP)'] || row['Amount'] || row['Quantity']) || 0,
              poAmount: parseFloat(row['PO Amount (PHP)'] || row['PO Amount']) || 0,
              status: ProcurementStatus.CMO_Approval, // Start with CMO Approval
              createdBy: row['Created By'] || row['Requested By'] || 'System Import',
              dateRequested: row['Date Requested'] || row['Date'] || new Date().toISOString().split('T')[0],
              dateCompleted: row['Date Completed'] || undefined,
              lastUpdated: new Date().toISOString(),
              notes: row['Notes'] || row['Remarks'] || '',
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
                cmo: { status: 'processing', receivedDate: new Date().toISOString().split('T')[0] },
                it: { status: isTechnical ? 'pending' : 'na' },
                budget: emptyStation(),
                gso: emptyStation(),
                bac: emptyStation(),
                po: emptyStation(),
                delivery: emptyStation(),
                accounting: emptyStation(),
                treasury: emptyStation()
              }
            };
          });

          resolve(importedData);
        } catch (err) {
          reject(new Error("Import process failed. Ensure the Excel file contains required columns like Item Name, Category, or Type."));
        }
      };
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsBinaryString(file);
    });
  }
};
