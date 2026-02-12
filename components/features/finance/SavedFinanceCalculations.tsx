'use client';

import { useEffect, useState } from 'react';
import {
  clearSavedFinanceCalculations,
  getSavedFinanceCalculations,
  onFinanceSavedUpdate,
  removeSavedFinanceCalculation,
  type FinanceToolId,
  type SavedFinanceCalculation,
} from '@/shared/analytics/financeSaved';

type Props = {
  tool?: FinanceToolId;
};

function toolLabel(tool: FinanceToolId): string {
  switch (tool) {
    case 'loan':
      return 'وام';
    case 'salary':
      return 'حقوق';
    case 'interest':
      return 'سود بانکی';
    default:
      return tool;
  }
}

export default function SavedFinanceCalculations({ tool }: Props) {
  const [items, setItems] = useState<SavedFinanceCalculation[]>([]);

  useEffect(() => {
    const update = () => {
      const next = getSavedFinanceCalculations();
      setItems(tool ? next.filter((item) => item.tool === tool) : next);
    };
    update();
    return onFinanceSavedUpdate(update);
  }, [tool]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">محاسبات ذخیره‌شده</h3>
        <button
          type="button"
          onClick={clearSavedFinanceCalculations}
          className="text-xs font-semibold text-[var(--color-danger)]"
        >
          پاک‌سازی همه
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {toolLabel(item.tool)} | {new Date(item.createdAt).toLocaleString('fa-IR')}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">{item.summary}</div>
              </div>
              <button
                type="button"
                onClick={() => removeSavedFinanceCalculation(item.id)}
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
