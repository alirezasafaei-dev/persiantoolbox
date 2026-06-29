import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx';
import type { FormalLetterData } from './types';
import { DISCLAIMER, LETTER_TYPE_LABELS } from './types';
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

function buildDocxFromData(data: FormalLetterData): Paragraph[] {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: data.senderOrganization ?? 'نامه اداری', bold: true, size: 26 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: LETTER_TYPE_LABELS[data.letterType], size: 18, color: '666666' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
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

  addField('تاریخ', formatDate(data.letterDate));
  addField('شماره', data.referenceNumber ?? `LTR-${Date.now().toString(36).toUpperCase()}`);
  addField(
    'فرستنده',
    `${data.senderName}${data.senderPosition ? ` — ${data.senderPosition}` : ''}`,
  );
  addField(
    'گیرنده',
    `${data.recipientName}${data.recipientPosition ? ` — ${data.recipientPosition}` : ''}`,
  );

  children.push(new Paragraph({ spacing: { before: 120 } }));

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `موضوع: ${data.subject}`, bold: true, size: 20, color: '1e3a5f' }),
      ],
      spacing: { before: 120, after: 120 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.salutation, size: 18 })],
      spacing: { after: 80 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.body, size: 18 })],
      spacing: { after: 120 },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.closing, size: 18 })],
      spacing: { after: 200 },
    }),
  );

  children.push(new Paragraph({ spacing: { before: 200 } }));

  if (data.enclosures) {
    addField('پیوست‌ها', data.enclosures);
  }

  if (data.ccList) {
    addField('رونوشت', data.ccList);
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: DISCLAIMER, size: 16, color: '666666', italics: true })],
      spacing: { before: 400, after: 200 },
    }),
  );

  return children;
}

export async function downloadDocx(data: FormalLetterData, filename: string): Promise<void> {
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
