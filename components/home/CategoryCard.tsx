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
  const topTools = tools.slice(0, 5);
  const categoryPath = getCategoryLandingPath(categoryId);

  return (
    <div className="group relative flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] transition-all duration-[var(--motion-normal)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-medium)]">
      <div
        className={`h-1.5 w-full rounded-t-[var(--radius-lg)] bg-gradient-to-r ${meta.accent}`}
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {group ? (
            <span className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
              {group.title}
            </span>
          ) : null}
          {meta.popular ? (
            <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
              پرجستجو
            </span>
          ) : null}
          {meta.flagship ? (
            <span className="rounded-full bg-[rgb(var(--color-warning-rgb)/0.12)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-warning)]">
              محصول حرفه‌ای
            </span>
          ) : null}
        </div>

        <Link href={categoryPath} className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-2)] text-xl group-hover:bg-[var(--color-primary)]/10 transition-colors">
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
              {meta.shortName}
            </h3>
            <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">{meta.tagline}</p>
            <p className="mt-1 text-[11px] font-semibold text-[var(--text-secondary)]">
              {toPersianNumbers(count)} ابزار
            </p>
          </div>
        </Link>

        {topTools.length > 0 ? (
          <div className="space-y-1">
            {topTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--text-muted)]" />
                <span className="truncate">{toolShortName(tool.title)}</span>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <Link
            href={categoryPath}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            <span>مشاهده همه ابزارها</span>
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
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--color-primary)]"
          >
            راهنمای موضوعی
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
