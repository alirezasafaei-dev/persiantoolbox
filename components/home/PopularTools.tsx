'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import ToolCard from '@/shared/ui/ToolCard';
import { IconCalculator, IconImage, IconMoney, IconPdf } from '@/shared/ui/icons';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

type ToolEntry = {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  iconWrapClassName: string;
  meta?: string | undefined;
};

const toolIndex: ToolEntry[] = [
  {
    id: 'merge-pdf',
    title: 'ادغام PDF',
    description: 'چند فایل را در یک PDF یکپارچه ترکیب کنید.',
    path: '/pdf-tools/merge/merge-pdf',
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  {
    id: 'compress-pdf',
    title: 'فشرده‌سازی PDF',
    description: 'حجم فایل‌ها را با حفظ کیفیت کاهش دهید.',
    path: '/pdf-tools/compress/compress-pdf',
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  {
    id: 'image-tools',
    title: 'ابزارهای تصویر',
    description: 'فشرده‌سازی و بهینه‌سازی تصاویر با کنترل کیفیت.',
    path: '/image-tools',
    icon: <IconImage className="h-7 w-7 text-[var(--color-info)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
  },
  {
    id: 'loan',
    title: 'محاسبه‌گر وام',
    description: 'اقساط ماهانه و سود کل را ببینید.',
    path: '/loan',
    icon: <IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
  },
  {
    id: 'salary',
    title: 'محاسبه‌گر حقوق',
    description: 'حقوق خالص، بیمه و مالیات را سریع محاسبه کنید.',
    path: '/salary',
    icon: <IconMoney className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
];

type DisplayTool = ToolEntry & {
  meta?: string;
};

export default function PopularTools() {
  const [items, setItems] = useState<DisplayTool[]>([]);
  const [hasUsage, setHasUsage] = useState(false);

  const defaultItems = useMemo(() => toolIndex.slice(0, 4), []);

  useEffect(() => {
    const snapshot = getUsageSnapshot();
    const withCounts = toolIndex.map((tool) => ({
      ...tool,
      count: snapshot.paths[tool.path] ?? 0,
    }));
    const hasAnyUsage = withCounts.some((tool) => tool.count > 0);
    const sorted = [...withCounts].sort((a, b) => b.count - a.count);

    const selected = (hasAnyUsage ? sorted : withCounts).slice(0, 4).map((tool) => ({
      ...tool,
      meta: hasAnyUsage
        ? tool.count > 0
          ? `${toPersianNumbers(tool.count)} بازدید اخیر`
          : 'پیشنهادی'
        : 'پیشنهادی',
    }));

    setItems(selected);
    setHasUsage(hasAnyUsage);
  }, []);

  const renderedItems = items.length ? items : defaultItems;

  return (
    <section className="space-y-6" aria-labelledby="popular-tools-heading">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="popular-tools-heading" className="text-3xl font-black text-[var(--text-primary)]">
          محبوب‌ترین ابزارها
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {hasUsage ? 'بر اساس استفاده اخیر شما' : 'پیشنهادهای آماده برای شروع سریع'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {renderedItems.map((tool) => (
          <ToolCard
            key={tool.id}
            href={tool.path}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            meta={tool.meta ?? ''}
            iconWrapClassName={tool.iconWrapClassName}
          />
        ))}
      </div>
    </section>
  );
}
