'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { clearUsage, getUsageSnapshot } from '@/shared/analytics/localUsage';

type UsageSnapshot = ReturnType<typeof getUsageSnapshot>;

const formatDate = (value: number) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function UsageDashboardPage() {
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(getUsageSnapshot());
  }, []);

  const refresh = () => {
    setSnapshot(getUsageSnapshot());
  };

  const reset = () => {
    clearUsage();
    setSnapshot(getUsageSnapshot());
  };

  const entries = snapshot ? Object.entries(snapshot.paths).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">داشبورد استفاده</h1>
        <p className="text-[var(--text-secondary)]">
          گزارش استفاده به صورت محلی روی همین دستگاه ذخیره می‌شود.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={refresh}>
          بروزرسانی
        </Button>
        <Button type="button" variant="tertiary" onClick={reset}>
          پاک‌سازی داده‌ها
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3">
            کل بازدیدها: {snapshot?.totalViews ?? 0}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3">
            آخرین بروزرسانی: {snapshot?.lastUpdated ? formatDate(snapshot.lastUpdated) : '-'}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3">
            تعداد مسیرها: {entries.length}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">پربازدیدترین مسیرها</h2>
        {entries.length === 0 && (
          <div className="text-sm text-[var(--text-muted)]">هنوز داده‌ای ثبت نشده است.</div>
        )}
        {entries.length > 0 && (
          <div className="space-y-3">
            {entries.map(([path, count]) => (
              <div
                key={path}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm"
              >
                <span className="text-[var(--text-primary)]">{path}</span>
                <span className="font-semibold text-[var(--text-secondary)]">{count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
