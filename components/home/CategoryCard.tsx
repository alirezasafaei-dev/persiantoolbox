import Link from 'next/link';
import {
  getCategoryCatalogEntry,
  getCategoryGroup,
  getCategoryLandingPath,
} from '@/lib/category-catalog';
import { getToolsByCategory, getCategoryDisplayCount } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

function toolShortName(title: string): string {
  const idx = title.indexOf(' - ');
  return idx !== -1 ? title.slice(0, idx) : title;
}

function CategoryCardInner({ categoryId }: { categoryId: string }) {
  const meta = getCategoryCatalogEntry(categoryId);
  if (!meta) {
    return null;
  }

  const group = getCategoryGroup(meta.groupId);
  const tools = getToolsByCategory(categoryId);
  const count = getCategoryDisplayCount(categoryId);
  const topTools = tools.slice(0, 3);
  const categoryPath = getCategoryLandingPath(categoryId);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] transition-all duration-[var(--motion-normal)] hover:-translate-y-0.5 hover:border-[var(--color-primary)]/45 hover:shadow-[var(--shadow-medium)]">
      <div className={`h-1 w-full bg-gradient-to-r ${meta.accent}`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <Link href={categoryPath} className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] text-xl transition-colors group-hover:border-[var(--color-primary)]/30 group-hover:bg-[rgb(var(--color-primary-rgb)/0.08)]">
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-primary)]">
              ابزارهای {meta.shortName}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{meta.tagline}</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgb(var(--color-success-rgb)/0.1)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-success)]">
            رایگان
          </span>
          <span className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
            {toPersianNumbers(count)} ابزار
          </span>
          {group ? (
            <span className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
              {group.title}
            </span>
          ) : null}
          {meta.popular ? (
            <span className="rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
              پرجستجو
            </span>
          ) : null}
        </div>

        {topTools.length > 0 ? (
          <div className="grid gap-1.5">
            {topTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="flex min-h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-transparent bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]/60" />
                <span className="truncate">{toolShortName(tool.title)}</span>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <Link
            href={categoryPath}
            className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[rgb(var(--color-primary-rgb)/0.16)]"
          >
            <span>همه ابزارهای رایگان</span>
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <Link
            href={meta.topicsPath}
            className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--color-primary)]"
          >
            راهنمای این دسته
          </Link>
        </div>
      </div>
    </div>
  );
}

type CategoryCardProps = {
  categoryId: string;
};

export default function CategoryCard({ categoryId }: CategoryCardProps) {
  return <CategoryCardInner categoryId={categoryId} />;
}
