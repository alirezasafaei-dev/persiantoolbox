import Link from 'next/link';
import type { ReactNode } from 'react';
import { getHomeSectionCopy } from '@/lib/home-copy';
import { getNewestTools } from '@/lib/tools-registry';
import {
  IconPdf,
  IconImage,
  IconMoney,
  IconCalendar,
  IconCalculator,
  IconShield,
  IconZap,
} from '@/shared/ui/icons';

const categoryIcons: Record<string, ReactNode> = {
  'pdf-tools': <IconPdf className="h-6 w-6" />,
  'image-tools': <IconImage className="h-6 w-6" />,
  'finance-tools': <IconMoney className="h-6 w-6" />,
  'date-tools': <IconCalendar className="h-6 w-6" />,
  'text-tools': <IconCalculator className="h-6 w-6" />,
  'validation-tools': <IconShield className="h-6 w-6" />,
};

export default function NewToolsSection() {
  const newestTools = getNewestTools(6);
  const sections = getHomeSectionCopy();

  return (
    <section className="space-y-6" aria-labelledby="newest-heading">
      <div className="flex flex-col gap-2 text-center">
        <h3 id="newest-heading" className="text-2xl font-black text-(--text-primary)">
          {sections.newest.title}
        </h3>
        <p className="text-sm text-(--text-muted)">{sections.newest.subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {newestTools.map((tool, index) => (
          <Link
            key={tool.path}
            href={tool.path}
            className={`group flex items-center gap-4 rounded-lg border bg-(--surface-1) p-4 transition-all duration-200 hover:shadow-medium ${
              index === 0
                ? 'border-primary/40 ring-1 ring-primary/20'
                : 'border-(--border-light) hover:border-primary'
            }`}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[rgb(var(--color-primary-rgb)/0.08)] text-primary"
              aria-hidden="true"
            >
              {categoryIcons[tool.category?.id ?? ''] ?? <IconZap className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-(--text-primary) transition-colors group-hover:text-primary">
                  {tool.title.split(' - ')[0]}
                </div>
                {index === 0 ? (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                    جدید
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 line-clamp-1 text-xs text-(--text-muted)">
                {tool.description}
              </div>
            </div>
            <span className="shrink-0 text-primary" aria-hidden="true">
              ←
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
