'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '@/shared/ui/Tag';
import type { BlogPostMeta } from '@/lib/blog';
import { useBookmarks } from './BlogBookmarks';
import { getTotalReactionCount } from './BlogReactions';

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; gradient: string; icon: string }
> = {
  آموزشی: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    gradient:
      'from-blue-500/15 via-blue-400/8 to-indigo-500/5 dark:from-blue-400/20 dark:via-blue-300/10 dark:to-indigo-400/8',
    icon: '📘',
  },
  اخبار: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    gradient:
      'from-green-500/15 via-emerald-400/8 to-teal-500/5 dark:from-green-400/20 dark:via-emerald-300/10 dark:to-teal-400/8',
    icon: '📰',
  },
  راهنما: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    gradient:
      'from-purple-500/15 via-violet-400/8 to-fuchsia-500/5 dark:from-purple-400/20 dark:via-violet-300/10 dark:to-fuchsia-400/8',
    icon: '🔧',
  },
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  مبتدی: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  متوسط: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  پیشرفته: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
};

function getReadingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

function getAuthorColor(name: string): string {
  const colors = [
    '#2563eb',
    '#16a34a',
    '#9333ea',
    '#ea580c',
    '#0891b2',
    '#c026d3',
    '#ca8a04',
    '#dc2626',
    '#0d9488',
    '#7c3aed',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

type Props = {
  post: BlogPostMeta;
  isNewest?: boolean;
};

export default function BlogCard({ post, isNewest }: Props) {
  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const readingTime = getReadingTime(post.wordCount);
  const categoryColor = CATEGORY_COLORS[post.category] ?? {
    bg: 'bg-[var(--surface-2)]',
    text: 'text-[var(--text-secondary)]',
    border: 'border-[var(--border-light)]',
    gradient: 'from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-[var(--surface-2)]',
    icon: '📄',
  };

  const { bookmarked, toggle } = useBookmarks(post.slug);
  const [reactionCount, setReactionCount] = useState(0);

  useEffect(() => {
    setReactionCount(getTotalReactionCount(post.slug));
  }, [post.slug]);

  return (
    <article className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-medium)] hover:scale-[1.01] hover:shadow-[var(--shadow-strong)] hover:border-[var(--border-medium)]">
      <div
        className={`relative h-36 overflow-hidden bg-gradient-to-br ${categoryColor.gradient} flex items-center justify-center`}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span
            className="text-5xl opacity-60 transition-transform duration-500 group-hover:scale-110"
            aria-hidden="true"
          >
            {categoryColor.icon}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-1)] via-transparent to-transparent" />
      </div>

      <div className="p-5">
        {isNewest ? (
          <span className="mb-3 inline-flex items-center rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-bold text-white">
            جدیدترین
          </span>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={post.date}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span
            className={`rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} px-2 py-0.5 text-xs font-semibold`}
          >
            {post.category}
          </span>
          {post.difficulty && DIFFICULTY_STYLES[post.difficulty] ? (
            <span
              className={[
                'rounded-full border px-2 py-0.5 text-xs font-semibold',
                DIFFICULTY_STYLES[post.difficulty]!.bg,
                DIFFICULTY_STYLES[post.difficulty]!.text,
                DIFFICULTY_STYLES[post.difficulty]!.border,
              ].join(' ')}
            >
              {post.difficulty}
            </span>
          ) : null}
          {post.series ? (
            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
              مجموعه: {post.series}
            </span>
          ) : null}
          <span className="text-[var(--text-muted)]">{readingTime} دقیقه مطالعه</span>
        </div>

        <h2 className="mt-3 text-lg font-bold text-[var(--text-primary)]">
          <Link href={`/blog/${post.slug}`} className="focus-ring rounded-sm">
            {post.title}
          </Link>
        </h2>

        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)] line-clamp-2">
          {post.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/blog/tag/${tag}`}>
              <Tag size="sm">{tag}</Tag>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            مطالعه مقاله
            <span aria-hidden="true">←</span>
          </Link>

          <div className="flex items-center gap-2">
            {reactionCount > 0 && (
              <span className="text-[10px] text-[var(--text-muted)]">❤️ {reactionCount}</span>
            )}
            <button
              type="button"
              onClick={toggle}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                bookmarked
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--color-primary)]'
              }`}
              aria-label={bookmarked ? 'حذف از نشان‌ها' : 'نشان کردن'}
            >
              <svg
                className="h-3.5 w-3.5"
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
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: getAuthorColor(post.author) }}
              aria-label={post.author}
            >
              {post.author.charAt(0)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{post.author}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
