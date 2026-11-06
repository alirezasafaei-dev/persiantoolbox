'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { formatMoneyFa } from '@/shared/utils';
import { useToast } from '@/shared/ui/toast-context';
import type { InvoicePdfData } from '@/lib/invoice-tools/pdf';
import { InvoicePdfInputError } from '@/lib/invoice-tools/export-error';

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

async function generateInvoicePdf(data: InvoicePdfData) {
  const { createInvoicePdfBytes } = await import('@/lib/invoice-tools/pdf');
  let replacedCharacters = false;
  const pdfBytes = await createInvoicePdfBytes(data, () => {
    replacedCharacters = true;
  });
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${data.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  return replacedCharacters;
}

export default function InvoiceGenerator() {
  const { showToast } = useToast();
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
      const replacedCharacters = await generateInvoicePdf({
        clientName,
        items,
        taxRate,
        discount,
        paymentTerms,
        invoiceNumber,
      });
      if (replacedCharacters) {
        showToast(
          'برخی نمادها در PDF با علامت � نمایش داده شدند. فایل را پیش از ارسال بررسی کنید.',
          'info',
        );
      }
    } catch (error) {
      if (error instanceof InvoicePdfInputError) {
        showToast(
          'متن یا تعداد ردیف‌ها برای ساخت این فاکتور بیش از حد طولانی است. آن را کوتاه‌تر کنید یا در چند فاکتور تقسیم کنید.',
          'error',
        );
        return;
      }
      showToast('ساخت فایل PDF انجام نشد. دوباره تلاش کنید.', 'error');
    } finally {
      setLoading(false);
    }
  }, [clientName, items, taxRate, discount, paymentTerms, showToast]);

  const selectClasses =
    'w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-primary-rgb)/0.15),transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary)">
            ساخت فاکتور و صورتحساب
          </h1>
          <p className="text-base md:text-lg text-(--text-muted) leading-relaxed">
            فاکتور، صورتحساب و رسید پرداخت با فرمت PDF قابل چاپ
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-(--text-primary)">اطلاعات فاکتور</h2>
          <div className="space-y-3">
            <Input
              label="نام مشتری"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="نام شخص یا شرکت"
              aria-label="نام مشتری"
            />

            <div>
              <h3 className="text-sm font-medium text-(--text-primary) mb-2">اقلام</h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-end md:flex"
                  >
                    <div className="min-w-0 col-span-3 md:flex-1">
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
                    <div className="min-w-0 md:w-24">
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
                    <div className="min-w-0 md:w-36">
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
                      className="mb-1 text-danger hover:text-danger disabled:opacity-30 text-lg"
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
                className="mt-2 text-sm text-primary hover:underline"
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
              <label htmlFor="invoice-payment-terms" className="text-sm text-(--text-muted)">
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
          <h2 className="text-lg font-semibold text-(--text-primary)">خلاصه فاکتور</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
              <span className="text-sm text-(--text-muted)">جمع کل</span>
              <span className="text-sm font-bold text-(--text-primary)">
                {formatMoneyFa(subtotal)} تومان
              </span>
            </div>
            {parseFloat(taxRate) > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
                <span className="text-sm text-(--text-muted)">مالیات ({taxRate}%)</span>
                <span className="text-sm font-bold text-(--text-primary)">
                  {formatMoneyFa(tax)} تومان
                </span>
              </div>
            )}
            {discountNum > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
                <span className="text-sm text-(--text-muted)">تخفیف</span>
                <span className="text-sm font-bold text-success">
                  -{formatMoneyFa(discountNum)} تومان
                </span>
              </div>
            )}
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
                <span className="text-sm font-semibold text-(--text-primary)">
                  مبلغ قابل پرداخت
                </span>
                <span className="text-lg font-bold text-success">{formatMoneyFa(total)} تومان</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-(--bg-subtle) p-3 text-xs text-(--text-muted)">
            💡 شماره فاکتور به صورت خودکار افزایش می‌یابد.
          </div>
        </Card>
      </div>
    </div>
  );
}
