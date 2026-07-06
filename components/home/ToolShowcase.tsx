'use client';

import { useEffect, useMemo, useState } from 'react';
import ToolCard from '@/shared/ui/ToolCard';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import { homeToolIndex, type HomeToolEntry } from '@/shared/constants/home-tools';

type DisplayTool = HomeToolEntry & {
  meta?: string | undefined;
  count?: number | undefined;
};

type Props = {
  mode?: 'popular' | 'recent';
};

export default function ToolShowcase({ mode = 'popular' }: Props) {
  const [items, setItems] = useState<DisplayTool[]>([]);

  const curatedItems = useMemo(() => homeToolIndex.slice(0, 6) as DisplayTool[], []);

  useEffect(() => {
    const snapshot = getUsageSnapshot();
    const withCounts = homeToolIndex.map((tool) => ({
      ...tool,
      count: snapshot.paths[tool.path] ?? 0,
    }));
    const hasAnyUsage = withCounts.some((tool) => tool.count > 0);
    const sorted = [...withCounts].sort((a, b) => b.count - a.count);

    if (mode === 'recent') {
      if (!hasAnyUsage) {
        setItems([]);
        return;
      }
      const selected = sorted.slice(0, 4).map((tool) => ({
        ...tool,
        meta: tool.count > 0 ? `${toPersianNumbers(tool.count)} بازدید اخیر` : '',
      }));
      setItems(selected);
    } else {
      const selected = (hasAnyUsage ? sorted : withCounts).slice(0, 6).map((tool) => {
        let meta: string;
        if (hasAnyUsage) {
          meta = tool.count > 0 ? `${toPersianNumbers(tool.count)} بازدید` : 'پرتقاضا';
        } else {
          meta = 'پرتقاضا';
        }
        return {
          ...tool,
          meta,
        };
      });
      setItems(selected);
    }
  }, [mode]);

  const renderedItems = items.length ? items : curatedItems;

  const heading = mode === 'popular' ? 'ابزارهای پرتقاضا' : 'اخیراً استفاده‌شده';
  const headingId = mode === 'popular' ? 'popular-tools-heading' : 'recent-tools-heading';
  const subtitle =
    mode === 'popular'
      ? 'پرکاربردترین ابزارها در دسته‌بندی‌های مختلف'
      : 'ابزارهایی که اخیراً با آن‌ها کار کرده‌اید.';

  return (
    <section className="space-y-6" aria-labelledby={headingId}>
      <div className="flex flex-col gap-2 text-center">
        <h2 id={headingId} className="text-3xl font-black text-[var(--text-primary)]">
          {heading}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
