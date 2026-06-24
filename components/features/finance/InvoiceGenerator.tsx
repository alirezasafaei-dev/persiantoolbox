'use client';

import { useState, useCallback } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { formatMoneyFa } from '@/shared/utils';

type InvoiceItem = {
  description: string;
  quantity: string;
  unitPrice: string;
};

let invoiceCounter = 0;

function createEmptyItem(): InvoiceItem {
  return { description: '', quantity: '', unitPrice: '' };
}

function calcSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice.replace(/,/g, '')) || 0;
    return sum + qty * price;
  }, 0);
}

async function generateInvoicePdf(data: {
  clientName: string;
  items: InvoiceItem[];
  taxRate: string;
  discount: string;
  paymentTerms: string;
  invoiceNumber: string;
}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  let fontBytes: ArrayBuffer;
  const resp = await fetch('/fonts/Vazirmatn-Regular.ttf');
  fontBytes = await resp.arrayBuffer();

  const font = await pdfDoc.embedFont(fontBytes);
  let boldFont = font;
  try {
    const boldResp = await fetch('/fonts/Vazirmatn-Bold.ttf');
    boldFont = await pdfDoc.embedFont(await boldResp.arrayBuffer());
  } catch {
    boldFont = font;
  }

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  let y = height - 60;

  const drawRight = (text: string, yPos: number, options?: { size?: number; color?: ReturnType<typeof rgb>; bold?: boolean }) => {
    const size = options?.size ?? 12;
    const color = options?.color ?? rgb(0, 0, 0);
    const useFont = options?.bold ? boldFont : font;
    const textWidth = useFont.widthOfTextAtSize(text, size);
    page.drawText(text, { x: width - 50 - textWidth, y: yPos, size, font: useFont, color });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  drawRight('فاکتور فروش', y, { size: 20, color: rgb(0.15, 0.35, 0.65), bold: true });
  y -= 10;
  drawLine(y);
  y -= 25;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  drawRight(`شماره فاکتور: ${data.invoiceNumber}`, y, { size: 11 });
  y -= 20;
  drawRight(`تاریخ: ${dateStr}`, y, { size: 11 });
  y -= 20;
  if (data.clientName) {
    drawRight(`نام مشتری: ${data.clientName}`, y, { size: 11 });
    y -= 20;
  }
  y -= 10;

  drawRight('مشخصات کالا و خدمات', y, { size: 14, color: rgb(0.15, 0.35, 0.65), bold: true });
  y -= 5;
  drawLine(y);
  y -= 22;

  const colX = {
    desc: width - 50,
    qty: width - 250,
    price: width - 350,
    total: width - 460,
  };

  drawRight('شرح', y, { size: 10, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('تعداد', { x: colX.qty, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('unit', { x: colX.price, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('total', { x: colX.total, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 5;
  drawLine(y);
  y -= 18;

  const validItems = data.items.filter((item) => item.description || item.unitPrice);
  let subtotal = 0;

  validItems.forEach((item) => {
    const qty = parseFloat(item.quantity) || 1;
    const price = parseFloat(item.unitPrice.replace(/,/g, '')) || 0;
    const lineTotal = qty * price;
    subtotal += lineTotal;

    if (item.description) {
      drawRight(item.description, y, { size: 10 });
    }
    page.drawText(String(qty), { x: colX.qty, y, size: 10, font });
    page.drawText(formatMoneyFa(price), { x: colX.price, y, size: 10, font });
    page.drawText(formatMoneyFa(lineTotal), { x: colX.total, y, size: 10, font });
    y -= 18;
  });

  y -= 5;
  drawLine(y);
  y -= 22;

  const taxRate = parseFloat(data.taxRate) || 0;
  const discount = parseFloat(data.discount.replace(/,/g, '')) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;

  drawRight(`جمع کل: ${formatMoneyFa(subtotal)} تومان`, y, { size: 12, bold: true });
  y -= 20;
  if (taxRate > 0) {
    drawRight(`مالیات (${data.taxRate}%): ${formatMoneyFa(taxAmount)} تومان`, y, { size: 11 });
    y -= 20;
  }
  if (discount > 0) {
    drawRight(`تخفیف: ${formatMoneyFa(discount)} تومان`, y, { size: 11 });
    y -= 20;
  }
  drawLine(y);
  y -= 22;
  drawRight(`مبلغ قابل پرداخت: ${formatMoneyFa(total)} تومان`, y, { size: 14, color: rgb(0.15, 0.35, 0.65), bold: true });
  y -= 30;

  if (data.paymentTerms) {
    drawRight(`شرایط پرداخت: ${data.paymentTerms}`, y, { size: 10, color: rgb(0.4, 0.4, 0.4) });
    y -= 20;
  }
  y -= 20;

  drawLine(y);
  y -= 20;
  drawRight('PersianToolbox.ir | جعبه ابزار فارسی', y, { size: 10, color: rgb(0.4, 0.4, 0.6) });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${data.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InvoiceGenerator() {
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([createEmptyItem()]);
  const [taxRate, setTaxRate] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = calcSubtotal(items);
  const tax = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const discountNum = parseFloat(discount.replace(/,/g, '')) || 0;
  const total = subtotal + tax - discountNum;

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = useCallback(async () => {
    invoiceCounter++;
    const invoiceNumber = `INV-${String(invoiceCounter).padStart(4, '0')}`;
    setLoading(true);
    try {
      await generateInvoicePdf({
        clientName,
        items,
        taxRate,
        discount,
        paymentTerms,
        invoiceNumber,
      });
    } finally {
      setLoading(false);
    }
  }, [clientName, items, taxRate, discount, paymentTerms]);

  const selectClasses =
    'w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            ساخت فاکتور و صورتحساب
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            فاکتور، صورتحساب و رسید پرداخت با فرمت PDF قابل چاپ
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات فاکتور</h2>
          <div className="space-y-3">
            <Input
              label="نام مشتری"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="نام شخص یا شرکت"
              aria-label="نام مشتری"
            />

            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">اقلام</h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {index === 0 ? (
                        <Input
                          label="شرح"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="شرح کالا یا خدمات"
                          aria-label="شرح"
                        />
                      ) : (
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="شرح کالا یا خدمات"
                          aria-label="شرح"
                        />
                      )}
                    </div>
                    <div className="w-24">
                      {index === 0 ? (
                        <Input
                          label="تعداد"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="۱"
                          aria-label="تعداد"
                        />
                      ) : (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="۱"
                          aria-label="تعداد"
                        />
                      )}
                    </div>
                    <div className="w-36">
                      {index === 0 ? (
                        <Input
                          label="قیمت واحد (تومان)"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          placeholder="مثال: ۵۰۰,۰۰۰"
                          aria-label="قیمت واحد"
                        />
                      ) : (
                        <Input
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          placeholder="مثال: ۵۰۰,۰۰۰"
                          aria-label="قیمت واحد"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="mb-1 text-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-30 text-lg"
                      aria-label="حذف ردیف"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm text-[var(--color-primary)] hover:underline"
              >
                + افزودن ردیف
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="نرخ مالیات (٪)"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="مثال: ۱۰"
                aria-label="نرخ مالیات"
              />
              <Input
                label="تخفیف (تومان)"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="مثال: ۱۰۰,۰۰۰"
                aria-label="تخفیف"
              />
            </div>

            <div>
              <label htmlFor="invoice-payment-terms" className="text-sm text-[var(--text-muted)]">
                شرایط پرداخت
              </label>
              <select
                id="invoice-payment-terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className={selectClasses}
                aria-label="شرایط پرداخت"
              >
                <option value="">انتخاب کنید</option>
                <option value="نقدی">نقدی</option>
                <option value="چک">چک</option>
                <option value="انتقال بانکی">انتقال بانکی</option>
                <option value="اقساطی">اقساطی</option>
                <option value="پس از تحویل">پس از تحویل</option>
              </select>
            </div>

            <div className="pt-2">
              <Button onClick={handleGenerate} isLoading={loading} fullWidth>
                دانلود فاکتور PDF
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">خلاصه فاکتور</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">جمع کل</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(subtotal)} تومان
              </span>
            </div>
            {parseFloat(taxRate) > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">مالیات ({taxRate}%)</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {formatMoneyFa(tax)} تومان
                </span>
              </div>
            )}
            {discountNum > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">تخفیف</span>
                <span className="text-sm font-bold text-[var(--color-success)]">
                  -{formatMoneyFa(discountNum)} تومان
                </span>
              </div>
            )}
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  مبلغ قابل پرداخت
                </span>
                <span className="text-lg font-bold text-[var(--color-success)]">
                  {formatMoneyFa(total)} تومان
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
            💡 شماره فاکتور به صورت خودکار افزایش می‌یابد.
          </div>
        </Card>
      </div>
    </div>
  );
}
