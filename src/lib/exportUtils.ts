import Papa from 'papaparse';
import jsPDF from 'jspdf';

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  headers: string[],
  data: any[][],
  filename: string,
  title?: string
) => {
  const doc = new jsPDF();

  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  const startY = title ? 25 : 15;
  doc.setFontSize(10);

  let y = startY;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;

  doc.setFont('helvetica', 'bold');
  doc.text(headers.join(' | '), 14, y);
  y += lineHeight;

  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += lineHeight;

  doc.setFont('helvetica', 'normal');

  data.forEach((row) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }

    doc.text(row.map(cell => String(cell || '')).join(' | '), 14, y);
    y += lineHeight;
  });

  doc.save(`${filename}.pdf`);
};
