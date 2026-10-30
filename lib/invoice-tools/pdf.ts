import { PDFDocument, rgb } from 'pdf-lib';
import { formatMoneyFa } from '@/shared/utils/numbers';
import { createInvoiceFont, finishInvoiceFonts } from './rtl-pdf';

export type InvoicePdfData = {
  clientName: string;
  items: { description: string; quantity: string; unitPrice: string }[];
  taxRate: string;
  discount: string;
  paymentTerms: string;
  invoiceNumber: string;
};

export async function createInvoicePdfBytes(
  data: InvoicePdfData,
  onMissingCharacters?: (characters: string[]) => void,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const loadFont = async (name: string) => {
    const response = await fetch(`/fonts/Vazirmatn-${name}.ttf`);
    if (!response.ok) {
      throw new Error('Invoice font unavailable');
    }
    return new Uint8Array(await response.arrayBuffer());
  };
  const missingCharacters = new Set<string>();
  const recordMissing = (value: string) => {
    missingCharacters.add(value);
  };
  const regular = await createInvoiceFont(doc, await loadFont('Regular'), recordMissing);
  let bold = regular;
  try {
    bold = await createInvoiceFont(doc, await loadFont('Bold'), recordMissing);
  } catch {
    /* Regular remains readable. */
  }
  let page = doc.addPage([595, 842]);
  let y = 782;
  const blue = rgb(0.15, 0.35, 0.65);
  const gray = rgb(0.4, 0.4, 0.4);
  const line = () =>
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  const footer = () =>
    regular.draw(page, 'PersianToolbox.ir | جعبه ابزار فارسی', {
      right: 545,
      y: 35,
      size: 10,
      color: gray,
    });
  const nextPage = () => {
    footer();
    page = doc.addPage([595, 842]);
    y = 782;
  };
  const ensure = (height: number) => {
    if (y - height < 65) {
      nextPage();
    }
  };
  const text = (value: string, size = 11, strong = false) => {
    const font = strong ? bold : regular;
    for (const valueLine of font.wrap(value, 495, size)) {
      ensure(size + 7);
      font.draw(page, valueLine, { right: 545, y, size, color: strong ? blue : rgb(0, 0, 0) });
      y -= size + 7;
    }
  };
  text('فاکتور فروش', 20, true);
  line();
  y -= 25;
  const now = new Date();
  const date = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  text(`شماره فاکتور: ${data.invoiceNumber}`);
  text(`تاریخ: ${date}`);
  if (data.clientName) {
    text(`نام مشتری: ${data.clientName}`);
  }
  y -= 10;
  text('جزئیات کالا و خدمات', 14, true);

  const header = () => {
    ensure(55);
    line();
    y -= 21;
    for (const [label, right] of [
      ['شرح', 545],
      ['تعداد', 345],
      ['قیمت', 255],
      ['جمع', 145],
    ] as const) {
      regular.draw(page, label, { right, y, size: 10, color: gray });
    }
    y -= 7;
    line();
    y -= 18;
  };
  header();
  let subtotal = 0;
  for (const item of data.items.filter((item) => item.description || item.unitPrice)) {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice.replace(/,/g, '')) || 0;
    const total = quantity * price;
    subtotal += total;
    const description = regular.wrap(item.description, 180, 10);
    const numbers = [String(quantity), formatMoneyFa(price), formatMoneyFa(total)];
    const numberRights = [345, 255, 145];
    // Keep ordinary rows together; exceptionally long descriptions continue with repeated table headings.
    if (description.length * 16 < 630 && y - description.length * 16 < 65) {
      nextPage();
      header();
    }
    for (const [index, value] of description.entries()) {
      if (y - 16 < 65) {
        nextPage();
        header();
      }
      regular.draw(page, value, { right: 545, y, size: 10 });
      if (index === 0) {
        for (const [column, number] of numbers.entries()) {
          const right = numberRights[column];
          if (right === undefined) {
            continue;
          }
          const size = Math.min(10, 75 / Math.max(regular.measure(number, 1), 1));
          regular.draw(page, number, { right, y, size });
        }
      }
      y -= 16;
    }
  }
  y -= 8;
  ensure(150);
  line();
  y -= 23;
  const taxRate = parseFloat(data.taxRate) || 0;
  const discount = parseFloat(data.discount.replace(/,/g, '')) || 0;
  const tax = (subtotal * taxRate) / 100;
  text(`جمع کل: ${formatMoneyFa(subtotal)} تومان`, 12, true);
  if (taxRate > 0) {
    text(`مالیات (${data.taxRate}%): ${formatMoneyFa(tax)} تومان`);
  }
  if (discount > 0) {
    text(`تخفیف: ${formatMoneyFa(discount)} تومان`);
  }
  text(`مبلغ قابل پرداخت: ${formatMoneyFa(subtotal + tax - discount)} تومان`, 14, true);
  if (data.paymentTerms) {
    y -= 10;
    text(`شرایط پرداخت: ${data.paymentTerms}`, 10);
  }
  footer();
  await finishInvoiceFonts(doc, bold === regular ? [regular] : [regular, bold]);
  if (missingCharacters.size) {
    onMissingCharacters?.([...missingCharacters]);
  }
  return doc.save();
}
