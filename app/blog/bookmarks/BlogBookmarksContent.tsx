'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/features/blog/BlogCard';
import { getAllBookmarkedSlugs } from '@/components/features/blog/BlogBookmarks';
import type { BlogPostMeta } from '@/lib/blog';

type Props = {
  allPosts: BlogPostMeta[];
};

export default function BlogBookmarksContent({ allPosts }: Props) {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BlogPostMeta[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const slugs = getAllBookmarkedSlugs();
    const posts = allPosts.filter((p) => slugs.includes(p.slug));
    setBookmarkedPosts(posts);
    setLoaded(true);
  }, [allPosts]);

  if (!loaded) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">در حال بارگذاری...</p>
      </div>
    );
  }

  if (bookmarkedPosts.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
          <svg
            className="h-8 w-8 text-[var(--text-muted)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          هنوز مقاله‌ای نشان نکرده‌اید.
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          برای نشان کردن مقاله‌ها، روی آیکون بوکمارک در کارت مقاله کلیک کنید.
        </p>
        <Link
          href="/blog"
          className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)]"
        >
          مشاهده مقاله‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bookmarkedPosts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
