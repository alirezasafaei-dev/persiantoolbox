import Link from 'next/link';
import CategoryCard from '@/components/home/CategoryCard';
import { categoryGroups, getCategoriesByGroup } from '@/lib/category-catalog';
import { getToolCountForDisplay } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export default function CategoryGrid() {
  const totalTools = getToolCountForDisplay();

  return (
    <section className="space-y-8" aria-labelledby="quick-tools-heading">
      <div className="flex flex-col gap-3 text-center">
        <h2 id="quick-tools-heading" className="text-3xl font-black text-[var(--text-primary)]">
          دسته‌بندی ابزارها
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {toPersianNumbers(totalTools)} ابزار در {toPersianNumbers(categoryGroups.length)} گروه و{' '}
          {toPersianNumbers(
            categoryGroups.reduce((sum, group) => sum + getCategoriesByGroup(group.id).length, 0),
          )}{' '}
          دسته‌بندی تخصصی
        </p>
        <div className="flex justify-center">
          <Link
            href="/topics"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] hover:border-[var(--color-primary)]/40"
          >
            نقشه کامل ابزارها
          </Link>
        </div>
      </div>

      <div className="space-y-10">
        {categoryGroups.map((group) => {
          const entries = getCategoriesByGroup(group.id);
          if (entries.length === 0) {
            return null;
          }

          return (
            <div key={group.id} className="space-y-4">
              <div className="flex flex-col gap-1 border-b border-[var(--border-light)] pb-3">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{group.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{group.description}</p>
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
