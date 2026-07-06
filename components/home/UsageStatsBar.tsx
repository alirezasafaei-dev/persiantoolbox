'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { IconZap, IconShield, IconStar } from '@/shared/ui/icons';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

type Props = {
  toolsCount: number;
  postsCount: number;
};

type Stat = {
  id: string;
  value: string;
  label: string;
  icon: ReactNode;
  tone: string;
};

export default function UsageStatsBar({ toolsCount, postsCount }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats: Stat[] = [
    {
      id: 'tools',
      value: `${toPersianNumbers(toolsCount)}+`,
      label: 'ابزار فعال',
      icon: <IconZap className="h-5 w-5 text-[var(--color-primary)]" />,
      tone: 'bg-[rgb(var(--color-primary-rgb)/0.1)]',
    },
    {
      id: 'posts',
      value: `${toPersianNumbers(postsCount)}+`,
      label: 'مقاله آموزشی',
      icon: <IconStar className="h-5 w-5 text-[var(--color-warning)]" />,
      tone: 'bg-[rgb(var(--color-warning-rgb)/0.1)]',
    },
    {
      id: 'local',
      value: '۱۰۰٪',
      label: 'پردازش محلی',
      icon: <IconShield className="h-5 w-5 text-[var(--color-success)]" />,
      tone: 'bg-[rgb(var(--color-success-rgb)/0.1)]',
    },
  ];

  return (
    <section className="section-surface overflow-hidden" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        آمار استفاده
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-medium)] ${mounted ? 'opacity-100' : 'opacity-0'} ${(() => {
              if (stat.id === 'tools') {
                return 'transition-delay-0';
              }
              if (stat.id === 'posts') {
                return 'delay-75';
              }
              return 'delay-150';
            })()}`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${stat.tone} transition-transform duration-300 group-hover:scale-110`}
            >
              {stat.icon}
            </div>
            <div>
              <div
                suppressHydrationWarning
                className="text-2xl font-black text-[var(--text-primary)]"
              >
                {stat.value}
              </div>
              <div className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
