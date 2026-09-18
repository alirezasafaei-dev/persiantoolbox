'use client';

import Link from 'next/link';

interface TopTool {
  path: string;
  name: string;
  count: number;
}

interface TopToolsSectionProps {
  topTools: TopTool[];
}

export default function TopToolsSection({ topTools }: TopToolsSectionProps) {
  if (topTools.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5">
      <h3 className="text-lg font-bold text-(--text-primary) mb-3">ابزارهای پرتکرار شما</h3>
      <div className="flex flex-wrap gap-2">
        {topTools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="inline-flex items-center gap-1 rounded-full border border-(--border-light) bg-(--surface-2) px-3 py-1.5 text-sm font-medium text-(--text-primary) hover:bg-(--surface-3) transition-colors"
          >
            {tool.name}
            <span className="text-(--text-muted) text-xs">({tool.count})</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
