import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import type { BusinessDocumentDraft, BusinessDocumentTotals } from './types';
import { DISCLAIMER } from './types';
import { formatCurrency, toPersianDigits, toJalali, getDocumentTitle } from './calculations';

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
    setTimeout(() => {
      printWindow.print();
    }, 300);
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
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}

function makeDocxPartyInfo(
  party: {
    name: string;
    address?: string;
    phone?: string;
    nationalId?: string;
    registrationNo?: string;
    economicCode?: string;
  },
  label: string,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: label, bold: true, size: 22 })],
      spacing: { before: 200, after: 100 },
    }),
  );
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: party.name, size: 20 })],
      spacing: { after: 40 },
    }),
  );
  if (party.nationalId) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `کد ملی: ${toPersianDigits(party.nationalId)}`, size: 18 })],
        spacing: { after: 40 },
      }),
    );
  }
  if (party.registrationNo) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `شماره ثبت: ${toPersianDigits(party.registrationNo)}`, size: 18 }),
        ],
        spacing: { after: 40 },
      }),
    );
  }
  if (party.economicCode) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `کد اقتصادی: ${toPersianDigits(party.economicCode)}`, size: 18 }),
        ],
        spacing: { after: 40 },
      }),
    );
  }
  if (party.phone) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `تلفن: ${toPersianDigits(party.phone)}`, size: 18 })],
        spacing: { after: 40 },
      }),
    );
  }
  if (party.address) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `آدرس: ${party.address}`, size: 18 })],
        spacing: { after: 40 },
      }),
    );
  }
  return paragraphs;
}

export async function downloadDocx(
  draft: BusinessDocumentDraft,
  totals: BusinessDocumentTotals,
  filename: string,
): Promise<void> {
  const docTitle = getDocumentTitle(draft.documentType);
  const docNumber = draft.documentNumber ?? '';
  const docDate = draft.documentDate
    ? toJalali(new Date(draft.documentDate))
    : toJalali(new Date());

  const sectionChildren: Array<Paragraph | Table> = [];

  sectionChildren.push(
    new Paragraph({
      children: [new TextRun({ text: docTitle, bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
    }),
  );

  sectionChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `شماره: ${toPersianDigits(docNumber)}  |  تاریخ: ${docDate}`,
          size: 18,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  );

  sectionChildren.push(
    ...makeDocxPartyInfo(
      draft.seller,
      draft.documentType === 'receipt' ? 'دریافت‌کننده' : 'فروشنده',
    ),
  );
  sectionChildren.push(
    ...makeDocxPartyInfo(draft.buyer, draft.documentType === 'receipt' ? 'پرداخت‌کننده' : 'خریدار'),
  );

  const headerRow = new TableRow({
    children: ['ردیف', 'شرح', 'واحد', 'تعداد', 'قیمت واحد', 'جمع'].map(
      (text) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: '1e293b' },
          width: { size: 16, type: WidthType.PERCENTAGE },
        }),
    ),
  });

  const itemRows = draft.items.map(
    (item, idx) =>
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: toPersianDigits(String(idx + 1)), size: 18 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 8, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: item.description, size: 18 })] }),
            ],
            width: { size: 34, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.unit ?? '-', size: 18 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 12, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: toPersianDigits(String(item.quantity)), size: 18 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 10, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: formatCurrency(item.unitPrice), size: 18 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: formatCurrency(item.quantity * item.unitPrice), size: 18 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: 18, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
  );

  sectionChildren.push(
    new Paragraph({
      children: [new TextRun({ text: 'ردیف کالاها/خدمات', bold: true, size: 22 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 100 },
    }),
  );

  sectionChildren.push(
    new Table({
      rows: [headerRow, ...itemRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  );

  sectionChildren.push(
    new Paragraph({
      children: [new TextRun({ text: '' })],
      spacing: { after: 100 },
    }),
  );

  const summaryItems: Array<[string, string]> = [['جمع کل', formatCurrency(totals.subtotal)]];
  if (totals.discountAmount > 0) {
    summaryItems.push(['تخفیف', `-${formatCurrency(totals.discountAmount)}`]);
  }
  if (totals.taxAmount > 0) {
    summaryItems.push(['مالیات', formatCurrency(totals.taxAmount)]);
  }
  summaryItems.push(['مبلغ قابل پرداخت', formatCurrency(totals.grandTotal)]);

  for (const [label, value] of summaryItems) {
    const isGrand = label === 'مبلغ قابل پرداخت';
    sectionChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: isGrand, size: isGrand ? 24 : 20 }),
          new TextRun({ text: value, bold: isGrand, size: isGrand ? 24 : 20 }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 80 },
      }),
    );
  }

  if (draft.notes) {
    sectionChildren.push(
      new Paragraph({
        children: [new TextRun({ text: 'توضیحات', bold: true, size: 22 })],
        spacing: { before: 200, after: 100 },
      }),
    );
    sectionChildren.push(
      new Paragraph({
        children: [new TextRun({ text: draft.notes, size: 20 })],
        spacing: { after: 100 },
      }),
    );
  }

  sectionChildren.push(
    new Paragraph({
      children: [new TextRun({ text: DISCLAIMER, size: 16, color: '666666', italics: true })],
      spacing: { before: 400, after: 200 },
    }),
  );

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
        children: sectionChildren,
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
