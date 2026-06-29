import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import type { SalonData } from './types';
import { DISCLAIMER } from './types';
import { formatDate, toPersianDigits } from './calculations';

export function exportAsHtml(htmlContent: string, filename: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsPrintableHtml(htmlContent: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
}

export async function downloadPdf(htmlContent: string, filename: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.title = filename;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }
}

function buildDocxFromData(data: SalonData): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'قرارداد خدمات زیبایی', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  );

  children.push(new Paragraph({ spacing: { after: 200 } }));

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'طرفین قرارداد', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  const addField = (label: string, value: string) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 18 }),
          new TextRun({ text: value, size: 18 }),
        ],
        spacing: { after: 40 },
      }),
    );
  };

  addField('سالن زیبایی', data.salonName);
  addField('مالک سالن', data.salonOwnerName);
  addField('کد ملی مالک', data.salonOwnerNationalId);
  addField('تلفن مالک', data.salonOwnerPhone);
  addField('آدرس سالن', data.salonAddress);
  children.push(new Paragraph({ spacing: { after: 80 } }));
  addField('کارمند/متخصص', data.workerName);
  addField('کد ملی کارمند', data.workerNationalId);
  addField('تلفن کارمند', data.workerPhone);

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'شرایط کاری', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('نوع خدمات', data.serviceType);
  addField('تاریخ شروع', formatDate(data.startDate));
  addField('تاریخ پایان', formatDate(data.endDate));
  addField('ساعت کاری', data.workingHours);
  addField('روزهای کاری', data.workingDays);
  addField('نوع حقوق', data.salaryType);
  addField('حقوق پایه', `${toPersianDigits(data.baseSalary)} تومان`);
  if (data.commissionPercent) {
    addField('درصد کمیسیون', `${data.commissionPercent}٪`);
  }

  if (data.description) {
    children.push(new Paragraph({ spacing: { before: 120 } }));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.description, size: 18 })],
        spacing: { after: 120 },
      }),
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: DISCLAIMER, size: 16, color: '666666', italics: true })],
      spacing: { before: 400, after: 200 },
    }),
  );

  return children;
}

export async function downloadDocx(data: SalonData, filename: string): Promise<void> {
  const children = buildDocxFromData(data);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1.25),
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 20 },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function isDocxAvailable(): boolean {
  return true;
}
