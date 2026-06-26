'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import BlogCard from './BlogCard';
import type { BlogPostMeta } from '@/lib/blog';

type Props = {
  posts: BlogPostMeta[];
  categories: string[];
  category?: string | undefined;
};

const POSTS_PER_PAGE = 12;

export default function BlogListClient({ posts, categories, category }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'tags'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = posts;

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => (a.date > b.date ? -1 : 1));
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => (a.date < b.date ? -1 : 1));
    } else {
      result = [...result].sort((a, b) => b.tags.length - a.tags.length);
    }

    return result;
  }, [posts, category, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  if (posts.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-sm text-[var(--text-muted)]">
          {category ? `مقاله‌ای در دسته «${category}» یافت نشد.` : 'هنوز مقاله‌ای منتشر نشده است.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="جستجوی مقاله..."
            aria-label="جستجوی مقاله"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
          />
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            🔍
          </span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as typeof sortBy);
            setPage(1);
          }}
          className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
        >
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
          <option value="tags">بیشترین برچسب</option>
        </select>

        <div className="flex rounded-[var(--radius-md)] border border-[var(--border-light)] overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-secondary)]'}`}
            aria-pressed={viewMode === 'grid'}
          >
            ▦
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-secondary)]'}`}
            aria-pressed={viewMode === 'list'}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Category Filter */}
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

      {/* Post Count */}
      <div className="text-sm text-[var(--text-muted)]">
        {filtered.length} مقاله
        {search && (
          <button
            type="button"
            onClick={() => handleSearch('')}
            className="mr-2 text-[var(--color-primary)] hover:underline"
          >
            پاک کردن جستجو
          </button>
        )}
      </div>

      {/* Posts */}
      {paginated.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-sm text-[var(--text-muted)]">مقاله‌ای یافت نشد.</p>
          <button
            type="button"
            onClick={() => handleSearch('')}
            className="mt-2 text-sm text-[var(--color-primary)] hover:underline"
          >
            پاک کردن جستجو
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {paginated.map((post, index) => (
            <BlogCard key={post.slug} post={post} isNewest={page === 1 && index === 0} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{post.description}</p>
              </div>
              <span className="text-xs text-[var(--text-muted)] shrink-0">
                {new Date(post.date).toLocaleDateString('fa-IR')}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border-light)] disabled:opacity-50"
          >
            قبلی
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span className="px-1 text-[var(--text-muted)]">...</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-[var(--radius-md)] text-sm font-semibold ${
                    page === p
                      ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                      : 'border border-[var(--border-light)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border-light)] disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
