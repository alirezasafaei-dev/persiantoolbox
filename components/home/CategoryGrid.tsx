import Link from 'next/link';
import CategoryCard from '@/components/home/CategoryCard';
import { categoryGroups, getCategoriesByGroup } from '@/lib/category-catalog';
import { getHomeSectionCopy } from '@/lib/home-copy';

export default function CategoryGrid() {
  const sections = getHomeSectionCopy();

  return (
    <section className="space-y-8" aria-labelledby="quick-tools-heading">
      <div className="flex flex-col gap-3 text-center">
        <h2 id="quick-tools-heading" className="text-3xl font-black text-[var(--text-primary)]">
          {sections.categories.title}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{sections.categories.subtitle}</p>
        <div className="flex justify-center">
          <Link
            href="/topics"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] hover:border-[var(--color-primary)]/40"
          >
            {sections.categories.cta}
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {categoryGroups.map((group) => {
          const entries = getCategoriesByGroup(group.id);
          if (entries.length === 0) {
            return null;
          }

          return (
            <div key={group.id} className="space-y-4">
              <div className="flex flex-col gap-2 rounded-[var(--radius-md)] bg-[var(--surface-1)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">{group.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{group.description}</p>
                </div>
                <span className="w-fit rounded-full bg-[rgb(var(--color-success-rgb)/0.1)] px-3 py-1 text-xs font-bold text-[var(--color-success)]">
                  ابزارهای رایگان
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <CategoryCard key={entry.id} categoryId={entry.id} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
