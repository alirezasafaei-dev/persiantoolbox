import { PDFDocument, rgb } from 'pdf-lib';
import { createInvoiceFont, finishInvoiceFonts } from '@/lib/invoice-tools/rtl-pdf';
import type { BusinessDocumentDraft, BusinessDocumentTotals, BusinessParty } from './types';
import { DISCLAIMER, WATERMARK_TEXT } from './types';
import { formatCurrency, getDocumentTitle, toJalali, toPersianDigits } from './calculations';

export async function createBusinessPdfBytes(
  draft: BusinessDocumentDraft,
  totals: BusinessDocumentTotals,
  options: { watermark?: boolean } = {},
): Promise<Uint8Array> {
  if (draft.items.length > 1000) {
    throw new Error('Too many document items');
  }
  const doc = await PDFDocument.create();
  const load = async (weight: string) => {
    const response = await fetch(`/fonts/Vazirmatn-${weight}.ttf`);
    if (!response.ok) {
      throw new Error('Document font unavailable');
    }
    return new Uint8Array(await response.arrayBuffer());
  };
  const missing = new Set<string>();
  const regular = await createInvoiceFont(doc, await load('Regular'), (value) =>
    missing.add(value),
  );
  const bold = await createInvoiceFont(doc, await load('Bold'), (value) => missing.add(value));
  let page = doc.addPage([595, 842]);
  let y = 790;
  const blue = rgb(0.12, 0.22, 0.38);
  const decorate = () => {
    if (options.watermark) {
      regular.draw(page, WATERMARK_TEXT, {
        right: 545,
        y: 36,
        size: 10,
        color: rgb(0.65, 0.65, 0.65),
      });
    }
    regular.draw(page, toPersianDigits(String(doc.getPageCount())), { right: 52, y: 36, size: 9 });
  };
  const nextPage = () => {
    decorate();
    page = doc.addPage([595, 842]);
    y = 790;
  };
  const ensure = (height: number) => {
    if (y - height < 65) {
      nextPage();
    }
  };
  const text = (value: string, size = 11, strong = false) => {
    const font = strong ? bold : regular;
    for (const line of font.wrap(value, 495, size)) {
      ensure(size + 7);
      font.draw(page, line, { right: 545, y, size, color: strong ? blue : rgb(0.08, 0.08, 0.08) });
      y -= size + 7;
    }
  };
  if (draft.logoDataUrl) {
    // Only embedded image data is accepted; never fetch a user document/logo URL.
    const logo = /^data:image\/png;base64,/i.test(draft.logoDataUrl)
      ? await doc.embedPng(draft.logoDataUrl)
      : /^data:image\/jpe?g;base64,/i.test(draft.logoDataUrl)
        ? await doc.embedJpg(draft.logoDataUrl)
        : null;
    if (!logo) {
      throw new Error('Unsupported document logo');
    }
    const scale = Math.min(150 / logo.width, 50 / logo.height);
    page.drawImage(logo, {
      x: 545 - logo.width * scale,
      y: y - logo.height * scale,
      width: logo.width * scale,
      height: logo.height * scale,
    });
    y -= logo.height * scale + 15;
  }
  text(getDocumentTitle(draft.documentType), 20, true);
  if (draft.documentNumber) {
    text(`شماره: ${toPersianDigits(draft.documentNumber)}`);
  }
  text(`تاریخ: ${toJalali(draft.documentDate ? new Date(draft.documentDate) : new Date())}`);
  const party = (value: BusinessParty, label: string) => {
    y -= 10;
    text(label, 13, true);
    text(value.name);
    for (const [key, title] of [
      ['nationalId', 'کد ملی'],
      ['registrationNo', 'شماره ثبت'],
      ['economicCode', 'کد اقتصادی'],
      ['phone', 'تلفن'],
      ['email', 'ایمیل'],
      ['address', 'آدرس'],
    ] as const) {
      if (value[key]) {
        text(`${title}: ${value[key]}`);
      }
    }
  };
  party(draft.seller, draft.documentType === 'receipt' ? 'دریافت‌کننده' : 'فروشنده');
  party(draft.buyer, draft.documentType === 'receipt' ? 'پرداخت‌کننده' : 'خریدار');
  y -= 12;
  // Columns are declared in logical RTL order, with fixed content bounds.
  const columns = [
    { title: 'ردیف', right: 545, width: 28 },
    { title: 'شرح', right: 509, width: 152 },
    { title: 'واحد', right: 349, width: 40 },
    { title: 'تعداد', right: 301, width: 40 },
    { title: 'قیمت واحد', right: 253, width: 92 },
    { title: 'جمع', right: 153, width: 103 },
  ];
  const header = () => {
    ensure(40);
    for (const col of columns) {
      bold.draw(page, col.title, { right: col.right, y, size: 9, color: blue });
    }
    y -= 18;
    page.drawLine({
      start: { x: 50, y: y + 8 },
      end: { x: 545, y: y + 8 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
  };
  header();
  for (const [index, item] of draft.items.entries()) {
    const values = [
      toPersianDigits(String(index + 1)),
      item.description,
      item.unit ?? '-',
      toPersianDigits(String(item.quantity)),
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice),
    ];
    const cells = columns.map((col, i) => regular.wrap(values[i] ?? '', col.width, 9));
    const count = Math.max(1, ...cells.map((lines) => lines.length));
    if (count * 16 < 650 && y - count * 16 < 65) {
      nextPage();
      header();
    }
    for (let line = 0; line < count; line++) {
      if (y - 16 < 65) {
        nextPage();
        header();
      }
      for (const [i, col] of columns.entries()) {
        const value = cells[i]?.[line];
        if (value) {
          regular.draw(page, value, { right: col.right, y, size: 9 });
        }
      }
      y -= 16;
    }
    y -= 5;
  }
  y -= 12;
  const summaryHeight =
    bold.wrap(`جمع کل: ${formatCurrency(totals.subtotal)}`, 495, 12).length * 19 +
    (totals.discountAmount > 0
      ? regular.wrap(`تخفیف: ${formatCurrency(totals.discountAmount)}`, 495, 11).length * 18
      : 0) +
    (totals.taxAmount > 0
      ? regular.wrap(`مالیات: ${formatCurrency(totals.taxAmount)}`, 495, 11).length * 18
      : 0) +
    bold.wrap(`مبلغ قابل پرداخت: ${formatCurrency(totals.grandTotal)}`, 495, 14).length * 21;
  // Ordinary totals remain together; oversized blocks still use per-line pagination.
  ensure(Math.min(summaryHeight, 725));
  text(`جمع کل: ${formatCurrency(totals.subtotal)}`, 12, true);
  if (totals.discountAmount > 0) {
    text(`تخفیف: ${formatCurrency(totals.discountAmount)}`);
  }
  if (totals.taxAmount > 0) {
    text(`مالیات: ${formatCurrency(totals.taxAmount)}`);
  }
  text(`مبلغ قابل پرداخت: ${formatCurrency(totals.grandTotal)}`, 14, true);
  if (draft.notes) {
    y -= 12;
    text('توضیحات', 12, true);
    text(draft.notes);
  }
  if (draft.footer) {
    y -= 12;
    text(draft.footer, 10);
  }
  y -= 18;
  text(DISCLAIMER, 8);
  decorate();
  await finishInvoiceFonts(doc, [regular, bold]);
  if (missing.size) {
    throw new Error('Document contains unsupported characters');
  }
  return doc.save();
}
