'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pt-blog-bookmarks';

function getBookmarks(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // ignore localStorage errors
  }
}

export function useBookmarks(slug: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(getBookmarks().includes(slug));
  }, [slug]);

  const toggle = useCallback(() => {
    setBookmarked((prev) => {
      const list = getBookmarks();
      let next: string[];
      if (prev) {
        next = list.filter((s) => s !== slug);
      } else {
        next = [...list, slug];
      }
      saveBookmarks(next);
      return !prev;
    });
  }, [slug]);

  return { bookmarked, toggle };
}

export function getAllBookmarkedSlugs(): string[] {
  return getBookmarks();
}

export function getBookmarkCount(slug: string): number {
  const stored = getBookmarks();
  return stored.includes(slug) ? 1 : 0;
}

export default function BlogBookmarks({ slug }: { slug: string }) {
  const { bookmarked, toggle } = useBookmarks(slug);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        bookmarked
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
          : 'border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
      }`}
      aria-label={bookmarked ? 'حذف از نشان‌ها' : 'نشان کردن مقاله'}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
