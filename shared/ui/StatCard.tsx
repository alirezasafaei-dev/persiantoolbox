'use client';

import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  change?: { value: number; type: 'up' | 'down' | 'neutral' };
  icon?: ReactNode;
  description?: string;
};

export default function StatCard({ title, value, change, icon, description }: StatCardProps) {
  let changeColorClass = '';
  let changeArrow = '—';
  if (change) {
    if (change.type === 'up') {
      changeColorClass = 'text-success';
      changeArrow = '↑';
    } else if (change.type === 'down') {
      changeColorClass = 'text-danger';
      changeArrow = '↓';
    } else {
      changeColorClass = 'text-(--text-muted)';
    }
  }

  return (
    <div className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5 transition-shadow hover:shadow-medium">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-(--text-muted)">{title}</p>
          <p className="text-2xl font-black text-(--text-primary)">{value}</p>
          {change ? (
            <div className="flex items-center gap-1 text-xs">
              <span className={changeColorClass}>
                {changeArrow} {Math.abs(change.value)}%
              </span>
              <span className="text-(--text-muted)">نسبت به هفته قبل</span>
            </div>
          ) : null}
          {description ? <p className="text-xs text-(--text-muted)">{description}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
