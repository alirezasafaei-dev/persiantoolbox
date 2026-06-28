'use client';

import Link from 'next/link';
import { formatDate } from './account-utils';

interface RecentActivityItem {
  path: string;
  name: string;
  timestamp: number;
}

interface RecentActivitiesProps {
  recentActivities: RecentActivityItem[];
}

export default function RecentActivities({ recentActivities }: RecentActivitiesProps) {
  if (recentActivities.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">فعالیت اخیر</h2>
        <Link
          href="/history"
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          مشاهده همه
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {recentActivities.map((activity, index) => (
          <Link
            key={`${activity.path}-${index}`}
            href={activity.path}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:bg-[var(--surface-2)] hover:border-[var(--color-primary)]/30 transition-all duration-[var(--motion-normal)]"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {activity.name}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {formatDate(activity.timestamp)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
