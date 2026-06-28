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
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">ابزارهای پرتکرار شما</h3>
      <div className="flex flex-wrap gap-2">
        {topTools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
          >
            {tool.name}
            <span className="text-[var(--text-muted)] text-xs">({tool.count})</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
