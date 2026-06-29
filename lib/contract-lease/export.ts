import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import type { LeaseData } from './types';
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

function buildDocxFromData(data: LeaseData): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'اجاره‌نامه مسکونی', bold: true, size: 28 })],
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

  addField('موجر', data.landlordName);
  addField('کد ملی موجر', data.landlordNationalId);
  addField('تلفن موجر', data.landlordPhone);
  addField('آدرس موجر', data.landlordAddress);
  children.push(new Paragraph({ spacing: { after: 80 } }));
  addField('مستأجر', data.tenantName);
  addField('کد ملی مستأجر', data.tenantNationalId);
  addField('تلفن مستأجر', data.tenantPhone);
  addField('آدرس مستأجر', data.tenantAddress);

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مشخصات ملک', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('آدرس ملک', data.propertyAddress);
  addField('متراژ', `${data.propertyArea} متر مربع`);
  if (data.propertyFloor) {
    addField('طبقه', data.propertyFloor);
  }
  if (data.propertyUnit) {
    addField('واحد', data.propertyUnit);
  }
  if (data.propertyDeedType) {
    addField('نوع سند', data.propertyDeedType);
  }

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مدت و شرایط مالی', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('تاریخ شروع', formatDate(data.startDate));
  addField('تاریخ پایان', formatDate(data.endDate));
  addField('تاریخ تحویل', formatDate(data.deliveryDate));
  addField('ودیعه', `${toPersianDigits(data.depositAmount)} تومان`);
  addField('اجاره ماهانه', `${toPersianDigits(data.monthlyRent)} تومان`);
  addField('روز پرداخت', data.paymentDay);
  addField('روش پرداخت', data.paymentMethod);

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

export async function downloadDocx(data: LeaseData, filename: string): Promise<void> {
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
