'use client';

import { useEffect, useState } from 'react';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

type StatsData = {
  totalViews: number;
  totalCalculations: number;
  pdfFilesProcessed: number;
  financeCalculations: number;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = (n / 1_000_000).toFixed(1);
    return `${toPersianNumbers(m)} میلیون`;
  }
  if (n >= 1_000) {
    const k = Math.floor(n / 1_000);
    return `${toPersianNumbers(k)} هزار`;
  }
  return toPersianNumbers(n);
}

export default function SocialProofStats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => undefined);
  }, []);

  if (!stats || stats.totalViews === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-black text-[var(--color-primary)]">
            {formatCompact(stats.totalViews)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">بازدید کل</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-[var(--color-success)]">
            {formatCompact(stats.totalCalculations)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">محاسبه انجام شده</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-[var(--color-info)]">
            {formatCompact(stats.pdfFilesProcessed)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">فایل PDF پردازش شده</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-[var(--color-warning)]">
            {formatCompact(stats.financeCalculations)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">محاسبه مالی</div>
        </div>
      </div>
    </section>
  );
}
