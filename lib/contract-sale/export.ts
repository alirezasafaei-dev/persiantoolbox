import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import type { SaleAgreementData } from './types';
import { DISCLAIMER } from './types';
import { formatDate } from './calculations';

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

function buildDocxFromData(data: SaleAgreementData): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مبایعه‌نامه', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `تاریخ قرارداد: ${formatDate(data.contractDate)}`,
          size: 18,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

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

  addField('فروشنده', data.sellerName);
  addField('کد ملی فروشنده', data.sellerNationalId);
  addField('تلفن فروشنده', data.sellerPhone);
  addField('آدرس فروشنده', data.sellerAddress);
  children.push(new Paragraph({ spacing: { after: 80 } }));
  addField('خریدار', data.buyerName);
  addField('کد ملی خریدار', data.buyerNationalId);
  addField('تلفن خریدار', data.buyerPhone);
  addField('آدرس خریدار', data.buyerAddress);

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مشخصات ملک', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('آدرس ملک', data.propertyAddress);
  addField('متراژ', `${data.propertyArea} متر مربع`);
  addField('شماره سند', data.propertyDeedNo ?? '---');
  addField('شماره ثبت', data.propertyRegistryNo ?? '---');

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'مبلغ و نحوه پرداخت', bold: true, size: 22, color: '1e3a5f' }),
      ],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('قیمت کل', `${data.salePrice} ریال`);
  addField('بیعانه', `${data.depositAmount} ریال`);
  addField('روش پرداخت', data.paymentMethod);

  children.push(new Paragraph({ spacing: { before: 200 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'زمان‌بندی', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('تاریخ تحویل', formatDate(data.deliveryDate));
  addField('تاریخ تصرف', formatDate(data.possessionDate));

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

export async function downloadDocx(data: SaleAgreementData, filename: string): Promise<void> {
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
