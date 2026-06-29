import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import type { VehicleData } from './types';
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

function buildDocxFromData(data: VehicleData): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مبایعه‌نامه خودرو', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  );

  children.push(new Paragraph({ spacing: { after: 200 } }));

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

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'فروشنده', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('نام فروشنده', data.sellerName);
  addField('کد ملی', data.sellerNationalId);
  addField('تلفن', data.sellerPhone);

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'خریدار', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('نام خریدار', data.buyerName);
  addField('کد ملی', data.buyerNationalId);
  addField('تلفن', data.buyerPhone);

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'مشخصات خودرو', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('سازنده', data.vehicleMake);
  addField('مدل', data.vehicleModel);
  addField('سال ساخت', data.vehicleYear);
  addField('رنگ', data.vehicleColor);
  addField('شماره پلاک', data.plateNumber);
  addField('شماره شاسی', data.chassisNumber);
  addField('شماره موتور', data.engineNumber);
  addField('کارکرد', `${toPersianDigits(data.mileage)} کیلومتر`);

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'شرایط مالی', bold: true, size: 22, color: '1e3a5f' })],
      spacing: { before: 200, after: 120 },
    }),
  );

  addField('مبلغ فروش', `${toPersianDigits(data.salePrice)} تومان`);
  addField('روش پرداخت', data.paymentMethod);
  addField('تاریخ پرداخت', formatDate(data.paymentDate));
  addField('تاریخ تحویل', formatDate(data.deliveryDate));

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

export async function downloadDocx(data: VehicleData, filename: string): Promise<void> {
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
