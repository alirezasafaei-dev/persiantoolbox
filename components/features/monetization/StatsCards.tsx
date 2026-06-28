'use client';

import { Card } from '@/components/ui';
import type { UsageData, HistoryEntry, SubscriptionInfo } from './account-utils';

interface StatsCardsProps {
  uniqueToolsUsed: number;
  usageSnapshot: UsageData;
  subscription: SubscriptionInfo | null;
  history: HistoryEntry[];
}

export default function StatsCards({
  uniqueToolsUsed,
  usageSnapshot,
  subscription,
  history,
}: StatsCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Card className="p-5">
        <div className="text-sm text-[var(--text-muted)] mb-1">ابزارهای استفاده‌شده</div>
        <div className="text-2xl font-black text-[var(--color-primary)]">
          {uniqueToolsUsed.toLocaleString('fa-IR')}
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-sm text-[var(--text-muted)] mb-1">مجموع بازدیدها</div>
        <div className="text-2xl font-black text-[var(--color-primary)]">
          {(usageSnapshot.totalViews ?? 0).toLocaleString('fa-IR')}
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-sm text-[var(--text-muted)] mb-1">سناریوهای ذخیره‌شده</div>
        <div className="text-2xl font-black text-[var(--color-primary)]">
          {subscription ? '∞' : '۰'}
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-sm text-[var(--text-muted)] mb-1">گزارش‌های تولیدشده</div>
        <div className="text-2xl font-black text-[var(--color-primary)]">
          {history.length.toLocaleString('fa-IR')}
        </div>
      </Card>
    </section>
  );
}
