import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import type { WorkCertificateData } from './types';
import { DISCLAIMER } from './types';
import { toPersianDigits, formatDate } from './calculations';

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

function buildDocxFromData(data: WorkCertificateData): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'گواهی سابقه کار', bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
    }),
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'طبق ماده ۲۴ قانون کار جمهوری اسلامی ایران',
          size: 18,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  type RowPair = readonly [string, string];
  const rowData: RowPair[] = [
    ['نام کارمند', data.employeeName],
    ['کد ملی', data.nationalId ?? '---'],
    ['نام کارفرما / شرکت', data.employerName],
    ['شماره ثبت', data.employerRegistrationNo ?? '---'],
    ['واحد / دپارتمان', data.department ?? '---'],
    ['سمت شغلی', data.position],
    ['تاریخ شروع', formatDate(data.startDate)],
    ['تاریخ پایان', data.isCurrent ? 'تاکنون' : data.endDate ? formatDate(data.endDate) : '---'],
    ['آخرین حقوق', data.salary ? `${toPersianDigits(data.salary)} ریال` : '---'],
    ['علت خاتمه همکاری', data.reasonForLeaving ?? '---'],
  ];

  const rows = rowData.map(
    ([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] }),
            ],
            shading: { fill: 'f1f5f9', type: 'clear' as never },
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 18 })] })],
          }),
        ],
      }),
  );

  children.push(
    new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  );

  children.push(new Paragraph({ spacing: { before: 200 } }));

  if (data.description) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.description, size: 18 })],
        spacing: { after: 120 },
      }),
    );
  }

  children.push(new Paragraph({ spacing: { before: 200 } }));

  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'صادرکننده', bold: true, size: 18 })],
                }),
              ],
              shading: { fill: 'f1f5f9', type: 'clear' as never },
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: data.issuerName, size: 18 })] }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'سمت', bold: true, size: 18 })],
                }),
              ],
              shading: { fill: 'f1f5f9', type: 'clear' as never },
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: data.issuerPosition, size: 18 })] }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'تاریخ صدور', bold: true, size: 18 })],
                }),
              ],
              shading: { fill: 'f1f5f9', type: 'clear' as never },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: formatDate(data.certificateDate), size: 18 })],
                }),
              ],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: DISCLAIMER, size: 16, color: '666666', italics: true })],
      spacing: { before: 400, after: 200 },
    }),
  );

  return children;
}

export async function downloadDocx(data: WorkCertificateData, filename: string): Promise<void> {
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
