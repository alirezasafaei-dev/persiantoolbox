'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconShield, IconZap, IconPdf } from '@/shared/ui/icons';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';

import { toPersianNumbers } from '@/shared/utils/localization/persian';

type Props = {
  toolsCount: number;
  categoriesCount?: number;
};

export default function TrustStats({ toolsCount, categoriesCount = 0 }: Props) {
  const categoryLabel =
    categoriesCount > 0
      ? `ابزار کاربردی در ${toPersianNumbers(categoriesCount)} دسته‌بندی.`
      : 'ابزار کاربردی در دسته‌بندی‌های مختلف.';
  const baseStats = [
    {
      id: 'tools',
      title: 'ابزار فعال',
      value: `${toPersianNumbers(toolsCount)}+`,
      description: categoryLabel,
      icon: <IconZap className="h-5 w-5 text-[var(--color-primary)]" />,
      tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
    },
    {
      id: 'local',
      title: 'پردازش محلی',
      value: '۱۰۰٪',
      description: 'فایل‌ها در دستگاه شما می‌مانند.',
      icon: <IconShield className="h-5 w-5 text-[var(--color-success)]" />,
      tone: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
    },
    {
      id: 'no-signup',
      title: 'بدون ثبت‌نام',
      value: 'رایگان',
      description: 'همه ابزارها بدون ورود قابل استفاده‌اند.',
      icon: <IconZap className="h-5 w-5 text-[var(--color-info)]" />,
      tone: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
    },
  ];

  const [usageValue, setUsageValue] = useState(`${toolsCount} ابزار آماده استفاده`);

  useEffect(() => {
    const snapshot = getUsageSnapshot();
    const total = Object.values(snapshot.paths ?? {}).reduce((sum, value) => sum + value, 0);
    setUsageValue(
      total <= 0 ? `${toolsCount} ابزار آماده استفاده` : `${toPersianNumbers(total)} استفاده`,
    );
  }, [toolsCount]);

  return (
    <section className="section-surface p-8" aria-labelledby="trust-heading">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 id="trust-heading" className="text-3xl font-black text-[var(--text-primary)]">
          اعتماد و شفافیت
        </h2>
        <p className="text-sm text-[var(--text-muted)]">تجربه‌ای امن با کنترل کامل روی داده‌ها</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {baseStats.map((item) => (
          <div
            key={item.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/80 p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${item.tone}`}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-muted)]">{item.title}</div>
                <div className="text-lg font-black text-[var(--text-primary)]">{item.value}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{item.description}</p>
          </div>
        ))}

        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-danger-rgb)/0.12)]">
              <IconPdf className="h-5 w-5 text-[var(--color-danger)]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--text-muted)]">فعالیت اخیر شما</div>
              <div
                suppressHydrationWarning
                className="text-lg font-black text-[var(--text-primary)]"
              >
                {usageValue}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            بر اساس استفاده در همین دستگاه نمایش داده می‌شود.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link
          href="/privacy"
          className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          سیاست حریم خصوصی
        </Link>
      </div>
    </section>
  );
}
