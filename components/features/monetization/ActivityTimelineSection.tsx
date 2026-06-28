'use client';

import type { ActivityItem } from './account-utils';
import { formatDate } from './account-utils';

interface ActivityTimelineSectionProps {
  activityTimeline: ActivityItem[];
}

export default function ActivityTimelineSection({
  activityTimeline,
}: ActivityTimelineSectionProps) {
  if (activityTimeline.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">خط زمانی فعالیت</h3>
      <div className="relative">
        <div
          className="absolute right-3 top-0 bottom-0 w-px bg-[var(--border-light)]"
          aria-hidden="true"
        />
        <div className="space-y-4">
          {activityTimeline.map((item) => (
            <div key={item.id} className="relative flex gap-3">
              <div
                className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-xs"
                aria-hidden="true"
              >
                {item.type === 'tool_use' && '🔧'}
                {item.type === 'login' && '🔑'}
                {item.type === 'subscription' && '💳'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</div>
                {item.detail ? (
                  <div className="text-xs text-[var(--text-muted)] truncate">{item.detail}</div>
                ) : null}
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {formatDate(item.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
