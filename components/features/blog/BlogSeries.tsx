'use client';

import Link from 'next/link';
import type { SeriesInfo } from '@/lib/blog';
import { normalizeSeriesLabel } from '@/lib/blog-normalize';

type Props = {
  series: SeriesInfo;
  currentSlug: string;
};

export default function BlogSeries({ series, currentSlug }: Props) {
  const seriesName = normalizeSeriesLabel(series.name) ?? 'مجموعه';
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">مجموعه: {seriesName}</h2>
        <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {series.currentIndex + 1} از {series.totalPosts}
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] rounded-full transition-[width] duration-300"
          style={{ width: `${((series.currentIndex + 1) / series.totalPosts) * 100}%` }}
          role="progressbar"
          aria-valuenow={series.currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={series.totalPosts}
          aria-label={`پیشرفت مجموعه: ${series.currentIndex + 1} از ${series.totalPosts}`}
        />
      </div>

      <ol className="space-y-1">
        {series.posts.map((post, index) => {
          const isCurrent = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                  isCurrent
                    ? 'bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-[var(--color-primary)] text-white'
                      : index <= series.currentIndex
                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{post.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)]">
        {series.prevPost ? (
          <Link
            href={`/blog/${series.prevPost.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            <span aria-hidden="true">→</span>
            مقاله قبلی
          </Link>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">اولین مقاله مجموعه</span>
        )}
        {series.nextPost ? (
          <Link
            href={`/blog/${series.nextPost.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            مقاله بعدی
            <span aria-hidden="true">←</span>
          </Link>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">آخرین مقاله مجموعه</span>
        )}
      </div>
    </section>
  );
}
