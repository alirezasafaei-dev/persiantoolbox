'use client';

import { useEffect, useState } from 'react';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';

type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  threshold: number;
};

const BADGES: Badge[] = [
  { id: 'beginner', name: 'مبتدی', icon: '🌱', description: 'اولین استفاده', threshold: 1 },
  { id: 'explorer', name: 'کاشف', icon: '🔍', description: '۵ استفاده', threshold: 5 },
  { id: 'regular', name: 'مرتب', icon: '⭐', description: '۱۵ استفاده', threshold: 15 },
  { id: 'pro', name: 'حرفه‌ای', icon: '💎', description: '۳۰ استفاده', threshold: 30 },
  { id: 'expert', name: 'متخصص', icon: '🏆', description: '۵۰ استفاده', threshold: 50 },
  { id: 'master', name: 'استاد', icon: '👑', description: '۱۰۰ استفاده', threshold: 100 },
];

function getTotalUsage(): number {
  const snapshot = getUsageSnapshot();
  return Object.values(snapshot.paths ?? {}).reduce((sum, value) => sum + value, 0);
}

function getEarnedBadges(total: number): Badge[] {
  return BADGES.filter((b) => total >= b.threshold);
}

function getNextBadge(total: number): Badge | null {
  return BADGES.find((b) => total < b.threshold) ?? null;
}

export default function UserBadges() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(getTotalUsage());
  }, []);

  const earned = getEarnedBadges(total);
  const next = getNextBadge(total);

  if (total === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">نمادهای شما</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {earned.map((badge) => (
          <div
            key={badge.id}
            className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1.5"
            title={badge.description}
          >
            <span className="text-lg">{badge.icon}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{badge.name}</span>
          </div>
        ))}
      </div>

      {next ? (
        <div className="text-sm text-[var(--text-muted)]">
          <span className="font-semibold">بعدی:</span> {next.icon} {next.name} —{' '}
          {next.threshold - total} استفاده دیگر
        </div>
      ) : null}

      <div className="mt-2 text-xs text-[var(--text-muted)]">مجموع استفاده: {total}</div>
    </section>
  );
}
