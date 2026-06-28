import Link from 'next/link';
import type { ToolCategory } from '@/lib/tools-registry';
import { getIndexableTools } from '@/lib/tools-registry';

type Props = {
  currentPath: string;
  category: ToolCategory;
  limit?: number;
};

export default function RelatedTools({ currentPath, category, limit = 6 }: Props) {
  const related = getIndexableTools()
    .filter((tool) => tool.category?.id === category.id && tool.path !== currentPath)
    .slice(0, limit);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-bold text-[var(--text-primary)]">
        ابزارهای مرتبط در {category.name}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {tool.title.split(' - ')[0]}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
              {tool.description}
            </div>
          </Link>
        ))}
      </div>
      <Link
        href={category.path}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
      >
        مشاهده همه ابزارهای {category.name}
        <span aria-hidden="true">←</span>
      </Link>
    </section>
  );
}
