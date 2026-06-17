'use client';

import { useEffect, useMemo, useState } from 'react';
import ToolCard from '@/shared/ui/ToolCard';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import { homeToolIndex, type HomeToolEntry } from '@/shared/constants/home-tools';

type DisplayTool = HomeToolEntry & {
  meta?: string;
};

export default function PopularTools() {
  const [items, setItems] = useState<DisplayTool[]>([]);
  const [hasUsage, setHasUsage] = useState(false);

  const defaultItems = useMemo(() => homeToolIndex.slice(0, 4) as DisplayTool[], []);

  useEffect(() => {
    const snapshot = getUsageSnapshot();
    const withCounts = homeToolIndex.map((tool) => ({
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
