'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui';
import type { BusinessLineItem } from '@/lib/business-documents/types';
import { formatCurrency } from '@/lib/business-documents/calculations';
import Input from '@/shared/ui/Input';

type Props = {
  items: BusinessLineItem[];
  discountPercent: number;
  taxPercent: number;
  errors: string[];
  onUpdate: (items: BusinessLineItem[]) => void;
  onDiscountChange: (pct: number) => void;
  onTaxChange: (pct: number) => void;
};

const UNITS = ['عدد', 'ساعت', 'روز', 'متر', 'کیلوگرم', 'بسته'];

function createEmptyItem(): BusinessLineItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    unit: 'عدد',
  };
}

export default function LineItemsEditor({
  items,
  discountPercent,
  taxPercent,
  errors,
  onUpdate,
  onDiscountChange,
  onTaxChange,
}: Props) {
  const addItem = useCallback(() => {
    onUpdate([...items, createEmptyItem()]);
  }, [items, onUpdate]);

  const removeItem = useCallback(
    (id: string) => {
      if (items.length <= 1) {
        return;
      }
      onUpdate(items.filter((item) => item.id !== id));
    },
    [items, onUpdate],
  );

  const updateItem = useCallback(
    (id: string, field: keyof BusinessLineItem, value: string | number) => {
      onUpdate(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    },
    [items, onUpdate],
  );

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxable = subtotal - discountAmount;
  const taxAmount = taxable * (taxPercent / 100);
  const grandTotal = taxable + taxAmount;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
        اقلام سند
      </h3>

      {errors.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-[var(--color-danger)]" role="alert">
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-light)]">
              <th className="py-2 px-2 text-right text-xs font-semibold text-[var(--text-secondary)] w-12">
                ردیف
              </th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-[var(--text-secondary)]">
                شرح
              </th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-[var(--text-secondary)] w-28">
                واحد
              </th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-[var(--text-secondary)] w-20">
                تعداد
              </th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-[var(--text-secondary)] w-28">
                قیمت واحد
              </th>
              <th className="py-2 px-2 text-right text-xs font-semibold text-[var(--text-secondary)] w-28">
                جمع
              </th>
              <th className="py-2 px-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-[var(--border-light)]">
                <td className="py-2 px-2 text-xs text-[var(--text-muted)] text-center">
                  {idx + 1}
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="شرح کالا/خدمت"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  />
                </td>
                <td className="py-2 px-2">
                  <select
                    value={item.unit ?? 'عدد'}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    min={0}
                    value={item.quantity || ''}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1.5 text-sm text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice || ''}
                    onChange={(e) =>
                      updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1.5 text-sm text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  />
                </td>
                <td className="py-2 px-2 text-xs text-[var(--text-secondary)] text-center whitespace-nowrap">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
                <td className="py-2 px-2 text-center">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 text-sm font-bold p-1"
                      aria-label="حذف ردیف"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="tertiary" size="sm" onClick={addItem}>
        + افزودن ردیف
      </Button>

      <div className="border-t border-[var(--border-light)] pt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Input
            id="discount-percent"
            label="درصد تخفیف"
            type="number"
            min={0}
            max={100}
            value={discountPercent || ''}
            onChange={(e) => onDiscountChange(Math.max(0, Math.min(100, Number(e.target.value))))}
            placeholder="۰"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Input
            id="tax-percent"
            label="درصد مالیات"
            type="number"
            min={0}
            max={100}
            value={taxPercent || ''}
            onChange={(e) => onTaxChange(Math.max(0, Math.min(100, Number(e.target.value))))}
            placeholder="۰"
            dir="ltr"
          />
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2">
        <div className="flex justify-between text-sm text-[var(--text-secondary)]">
          <span>جمع کل</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-[var(--color-danger)]">
            <span>تخفیف</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm text-[var(--text-secondary)]">
            <span>مالیات</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] border-t border-[var(--border-light)] pt-2">
          <span>مبلغ قابل پرداخت</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
