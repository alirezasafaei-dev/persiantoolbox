'use client';

import { Card } from '@/components/ui';

type Props = {
  calculationName: string;
  formulaSummary?: string;
  legalBasis?: string;
  dataSource?: string;
  lastUpdated?: string;
  disclaimer?: string;
};

const DEFAULT_DISCLAIMER =
  'این محاسبات صرفاً جهت اطلاع‌رسانی است و جایگزین مشاوره مالی، حقوقی یا مالیاتی حرفه‌ای نیست.';

export default function FinancialTransparencyBox({
  calculationName,
  formulaSummary,
  legalBasis,
  dataSource,
  lastUpdated,
  disclaimer = DEFAULT_DISCLAIMER,
}: Props) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{calculationName}</h3>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        {formulaSummary ? (
          <div>
            <span className="text-[var(--text-muted)]">فرمول: </span>
            <span className="text-[var(--text-secondary)]">{formulaSummary}</span>
          </div>
        ) : null}
        {legalBasis ? (
          <div>
            <span className="text-[var(--text-muted)]">مستند قانونی: </span>
            <span className="text-[var(--text-secondary)]">{legalBasis}</span>
          </div>
        ) : null}
        {dataSource ? (
          <div>
            <span className="text-[var(--text-muted)]">منبع داده: </span>
            <span className="text-[var(--text-secondary)]">{dataSource}</span>
          </div>
        ) : null}
        {lastUpdated ? (
          <div>
            <span className="text-[var(--text-muted)]">آخرین به‌روزرسانی: </span>
            <span className="text-[var(--text-secondary)]">{lastUpdated}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
        <span className="mt-0.5 shrink-0">⚠️</span>
        <span>{disclaimer}</span>
      </div>
    </Card>
  );
}
