'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogCard from './BlogCard';
import type { BlogPostMeta } from '@/lib/blog';

const POSTS_PER_PAGE = 12;
const DEBOUNCE_MS = 300;

type SortOption = 'newest' | 'oldest' | 'most-tags';
type ViewMode = 'grid' | 'list';

type Props = {
  category?: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function BlogList({ category }: Props) {
  const allPosts = getAllPosts();
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;
  const categories = getAllCategories();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const searchRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const filteredAndSorted = useMemo(() => {
    let result = [...posts];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (a.date > b.date ? -1 : 1));
        break;
      case 'oldest':
        result.sort((a, b) => (a.date < b.date ? -1 : 1));
        break;
      case 'most-tags':
        result.sort((a, b) => b.tags.length - a.tags.length);
        break;
    }

    return result;
  }, [posts, debouncedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredAndSorted.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE,
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) {
        pages.push('...');
      }
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  const goPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {category
              ? `مقاله‌ای در دسته «${category}» یافت نشد.`
              : 'هنوز مقاله‌ای منتشر نشده است.'}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            مقاله‌های جدید به‌زودی اضافه خواهند شد.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {category && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">دسته: {category}</h2>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            مشاهده همه
          </Link>
        </div>
      )}

      {!category && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            className="rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]"
          >
            همه
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog/category/${cat}`}
              className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={searchRef}
            type="search"
            placeholder="جستجو در مقاله‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] py-2 pr-9 pl-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            aria-label="جستجو در مقاله‌ها"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <label htmlFor="blog-sort" className="text-xs text-[var(--text-muted)]">
              مرتب‌سازی:
            </label>
            <select
              id="blog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="newest">جدیدترین</option>
              <option value="oldest">قدیمی‌ترین</option>
              <option value="most-tags">بیشترین برچسب</option>
            </select>
          </div>

          <div
            className="flex rounded-[var(--radius-md)] border border-[var(--border-light)]"
            role="group"
            aria-label="حالت نمایش"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              aria-pressed={viewMode === 'grid'}
              aria-label="نمای شبکه‌ای"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25Zm9.75-9.75A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 15.75 13.5H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
              aria-pressed={viewMode === 'list'}
              aria-label="نمای لیستی"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>
          {filteredAndSorted.length} مقاله از {posts.length} مقاله
        </span>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              searchRef.current?.focus();
            }}
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            پاک کردن جستجو
          </button>
        )}
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            مقاله‌ای با جستجوی شما یافت نشد
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            عبارت جستجو را تغییر دهید یا دسته‌بندی دیگری را امتحان کنید.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              searchRef.current?.focus();
            }}
            className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            پاک کردن جستجو
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {paginatedPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} isNewest={index === 0 && page === 1} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedPosts.map((post) => (
            <BlogListItem key={post.slug} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1" aria-label="صفحه‌بندی">
          <button
            type="button"
            onClick={() => goPage(page - 1)}
            disabled={page === 1}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            قبلی
          </button>
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-xs text-[var(--text-muted)]">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goPage(p as number)}
                className={`rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold ${
                  p === page
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                }`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => goPage(page + 1)}
            disabled={page === totalPages}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            بعدی
          </button>
        </nav>
      )}
    </div>
  );
}

function BlogListItem({ post }: { post: BlogPostMeta }) {
  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-[var(--motion-fast)] hover:border-[var(--border-strong)] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={post.date}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
            {post.category}
          </span>
        </div>
        <h3 className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">
          <Link
            href={`/blog/${post.slug}`}
            className="focus-ring rounded-sm hover:text-[var(--color-primary)]"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-xs leading-6 text-[var(--text-secondary)]">
          {post.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="whitespace-nowrap text-[10px] text-[var(--text-muted)]">
          {post.tags.length} برچسب
        </span>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
        >
          مطالعه
          <span aria-hidden="true">←</span>
        </Link>
      </div>
    </article>
  );
}
