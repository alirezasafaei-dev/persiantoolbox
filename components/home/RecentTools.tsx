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

export default function RecentTools() {
  const [items, setItems] = useState<DisplayTool[]>([]);

  const defaultItems = useMemo(() => homeToolIndex.slice(0, 4) as DisplayTool[], []);

  useEffect(() => {
    const snapshot = getUsageSnapshot();
    const withCounts = homeToolIndex.map((tool) => ({
      ...tool,
      count: snapshot.paths[tool.path] ?? 0,
    }));
    const hasAnyUsage = withCounts.some((tool) => tool.count > 0);
    if (!hasAnyUsage) {
      setItems([]);
      return;
    }
    const sorted = [...withCounts].sort((a, b) => b.count - a.count);
    const selected: DisplayTool[] = sorted.slice(0, 4).map((tool) => ({
      ...tool,
      meta: tool.count > 0 ? `${toPersianNumbers(tool.count)} بازدید اخیر` : '',
    }));
    setItems(selected);
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="recent-tools-heading">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="recent-tools-heading" className="text-3xl font-black text-[var(--text-primary)]">
          اخیراً استفاده‌شده
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          ابزارهایی که اخیراً با آن‌ها کار کرده‌اید.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {(items.length ? items : defaultItems).map((tool) => (
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
