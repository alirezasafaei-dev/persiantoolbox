'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  clearSavedFinanceCalculations,
  getSavedFinanceCalculations,
  onFinanceSavedUpdate,
  deleteSavedFinanceCalculation,
  exportSavedCalculations,
  type FinanceToolId,
  type SavedFinanceCalculation,
} from '@/shared/analytics/financeSaved';
import Button from '@/shared/ui/Button';

type Props = {
  tool?: FinanceToolId;
};

const TOOL_LABELS: Record<string, string> = {
  loan: 'وام',
  salary: 'حقوق',
  interest: 'سود بانکی',
  'currency-converter': 'مبدل ارز',
  'inflation-calculator': 'تورم',
  'investment-calculator': 'سرمایه‌گذاری',
  'tax-calculator': 'مالیات',
  'insurance-calculator': 'بیمه',
  'bonus-calculator': 'عیدی',
  'severance-calculator': 'سنوات',
  'leave-calculator': 'مرخصی',
  'overtime-calculator': 'اضافه کاری',
  'retirement-calculator': 'بازنشستگی',
  'real-purchasing-power': 'قدرت خرید',
};

function toolLabel(tool: FinanceToolId): string {
  return TOOL_LABELS[tool] ?? tool;
}

export default function SavedFinanceCalculations({ tool }: Props) {
  const [items, setItems] = useState<SavedFinanceCalculation[]>([]);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const update = () => {
      const next = getSavedFinanceCalculations();
      setItems(tool ? next.filter((item) => item.tool === tool) : next);
    };
    update();
    return onFinanceSavedUpdate(update);
  }, [tool]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const comparedItems = items.filter((item) => compareIds.has(item.id));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          سناریوهای ذخیره‌شده ({items.length})
        </h3>
        <div className="flex gap-2">
          {compareIds.size >= 2 && (
            <Button variant="secondary" onClick={() => setShowCompare(!showCompare)}>
              {showCompare ? 'بستن مقایسه' : `مقایسه (${compareIds.size})`}
            </Button>
          )}
          <Button variant="secondary" onClick={() => exportSavedCalculations('json')}>
            خروجی JSON
          </Button>
          <Button variant="secondary" onClick={() => exportSavedCalculations('csv')}>
            خروجی CSV
          </Button>
          <button
            type="button"
            onClick={clearSavedFinanceCalculations}
            className="text-xs font-semibold text-[var(--color-danger)]"
          >
            پاک‌سازی همه
          </button>
        </div>
      </div>

      {showCompare && comparedItems.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-[var(--border-light)]">
                <th className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                  فیلد
                </th>
                {comparedItems.map((item, i) => (
                  <th
                    key={item.id}
                    className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]"
                  >
                    سناریو {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-light)]">
                <td className="px-3 py-2 text-[var(--text-muted)]">عنوان</td>
                {comparedItems.map((item) => (
                  <td key={item.id} className="px-3 py-2 text-[var(--text-primary)]">
                    {item.title}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border-light)]">
                <td className="px-3 py-2 text-[var(--text-muted)]">ابزار</td>
                {comparedItems.map((item) => (
                  <td key={item.id} className="px-3 py-2 text-[var(--text-primary)]">
                    {toolLabel(item.tool)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border-light)]">
                <td className="px-3 py-2 text-[var(--text-muted)]">خلاصه</td>
                {comparedItems.map((item) => (
                  <td key={item.id} className="px-3 py-2 text-[var(--text-secondary)]">
                    {item.summary}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 text-[var(--text-muted)]">تاریخ</td>
                {comparedItems.map((item) => (
                  <td key={item.id} className="px-3 py-2 text-[var(--text-muted)]">
                    {new Date(item.createdAt).toLocaleString('fa-IR')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-[var(--radius-md)] border px-4 py-3 transition-colors ${
              compareIds.has(item.id)
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--border-light)] bg-[var(--surface-2)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compareIds.has(item.id)}
                    onChange={() => toggleCompare(item.id)}
                    className="rounded"
                    aria-label={`انتخاب برای مقایسه: ${item.title}`}
                  />
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </div>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {toolLabel(item.tool)} | {new Date(item.createdAt).toLocaleString('fa-IR')}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">{item.summary}</div>
              </div>
              <button
                type="button"
                onClick={() => deleteSavedFinanceCalculation(item.id)}
                className="text-xs font-semibold text-[var(--color-danger)]"
              >
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
