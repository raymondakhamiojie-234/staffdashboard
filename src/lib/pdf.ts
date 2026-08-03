import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { uploadFile } from './supabase';

/**
 * Generates an invoice PDF and uploads it to Supabase
 */
export async function generateAndUploadInvoice({
  salaryId,
  staffName,
  role,
  amount,
  currency,
  effectiveDate,
  status,
  deductionsTotal = 0,
  deductionsList = []
}: {
  salaryId: number;
  staffName: string;
  role: string;
  amount: number;
  currency: string;
  effectiveDate: Date;
  status: string;
  deductionsTotal?: number;
  deductionsList?: { reason: string; amount: number }[];
}) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.text('Falcus Media', 14, 20);
  
  doc.setFontSize(16);
  doc.text('Salary Invoice', 14, 30);
  
  doc.setFontSize(12);
  doc.text(`Invoice #INV-${salaryId}-${new Date().getTime().toString().slice(-4)}`, 14, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);

  // Staff Details
  doc.text(`Employee: ${staffName}`, 14, 60);
  doc.text(`Role: ${role}`, 14, 66);
  doc.text(`Effective Period: ${new Date(effectiveDate).toLocaleDateString()}`, 14, 72);
  
  // Table
  const tableData = [
    ['Description', 'Amount'],
    ['Base Salary', `${currency} ${amount.toLocaleString()}`],
    ['Bonuses', `${currency} 0.00`],
    ['Deductions', `${currency} 0.00`]
  ];

  (doc as any).autoTable({
    startY: 85,
    head: [['Description', 'Amount']],
    body: [
      ['Base Salary', `${currency} ${amount.toLocaleString()}`],
      ['Bonuses', `${currency} 0.00`],
      ...deductionsList.map(d => [`Deduction: ${d.reason}`, `-${currency} ${d.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}`]),
      ...(deductionsList.length === 0 ? [['Deductions', `${currency} 0.00`]] : [])
    ],
    foot: [['Net Total', `${currency} ${(amount - deductionsTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}`]],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [41, 128, 185] }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 130;
  
  // Status
  doc.text(`Status: ${status.toUpperCase()}`, 14, finalY + 15);

  // Convert to Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  // Upload to Supabase
  const fileName = `invoices/INV_${salaryId}_${Date.now()}.pdf`;
  const file = new File([pdfBuffer], fileName, { type: 'application/pdf' });
  const fileUrl = await uploadFile(file);

  return fileUrl;
}
