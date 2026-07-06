'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '@/shared/ui/Tag';
import type { BlogPostMeta } from '@/lib/blog';
import {
  getCategoryRoute,
  normalizeCategoryLabel,
  normalizeSeriesLabel,
} from '@/lib/blog-normalize';
import { useBookmarks } from './BlogBookmarks';
import { getTotalReactionCount } from './BlogReactions';

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; gradient: string; icon: string }
> = {
  مالی: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    gradient:
      'from-emerald-500/15 via-green-400/8 to-teal-500/5 dark:from-emerald-400/20 dark:via-green-300/10 dark:to-teal-400/8',
    icon: '💰',
  },
  آموزشی: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    gradient:
      'from-blue-500/15 via-blue-400/8 to-indigo-500/5 dark:from-blue-400/20 dark:via-blue-300/10 dark:to-indigo-400/8',
    icon: '📘',
  },
  متنی: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    gradient:
      'from-violet-500/15 via-purple-400/8 to-fuchsia-500/5 dark:from-violet-400/20 dark:via-purple-300/10 dark:to-fuchsia-400/8',
    icon: '✍️',
  },
  ابزارها: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    gradient:
      'from-sky-500/15 via-cyan-400/8 to-blue-500/5 dark:from-sky-400/20 dark:via-cyan-300/10 dark:to-blue-400/8',
    icon: '🧰',
  },
  ابزار: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    gradient:
      'from-sky-500/15 via-cyan-400/8 to-blue-500/5 dark:from-sky-400/20 dark:via-cyan-300/10 dark:to-blue-400/8',
    icon: '🧰',
  },
  تاریخ: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    gradient:
      'from-amber-500/15 via-yellow-400/8 to-orange-500/5 dark:from-amber-400/20 dark:via-yellow-300/10 dark:to-orange-400/8',
    icon: '📅',
  },
  شغلی: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    gradient:
      'from-indigo-500/15 via-blue-400/8 to-violet-500/5 dark:from-indigo-400/20 dark:via-blue-300/10 dark:to-violet-400/8',
    icon: '💼',
  },
  کسب‌وکار: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    gradient:
      'from-rose-500/15 via-pink-400/8 to-red-500/5 dark:from-rose-400/20 dark:via-pink-300/10 dark:to-red-400/8',
    icon: '🏪',
  },
  راهنما: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    gradient:
      'from-purple-500/15 via-violet-400/8 to-fuchsia-500/5 dark:from-purple-400/20 dark:via-violet-300/10 dark:to-fuchsia-400/8',
    icon: '🔧',
  },
  حقوقی: {
    bg: 'bg-slate-50 dark:bg-slate-950/40',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    gradient:
      'from-slate-500/15 via-gray-400/8 to-zinc-500/5 dark:from-slate-400/20 dark:via-gray-300/10 dark:to-zinc-400/8',
    icon: '⚖️',
  },
  تصویر: {
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-800',
    gradient:
      'from-pink-500/15 via-rose-400/8 to-fuchsia-500/5 dark:from-pink-400/20 dark:via-rose-300/10 dark:to-fuchsia-400/8',
    icon: '🖼️',
  },
  امنیت: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    gradient:
      'from-red-500/15 via-orange-400/8 to-amber-500/5 dark:from-red-400/20 dark:via-orange-300/10 dark:to-amber-400/8',
    icon: '🔒',
  },
  نگارش: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    gradient:
      'from-teal-500/15 via-emerald-400/8 to-cyan-500/5 dark:from-teal-400/20 dark:via-emerald-300/10 dark:to-cyan-400/8',
    icon: '📝',
  },
  PDF: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    gradient:
      'from-orange-500/15 via-amber-400/8 to-yellow-500/5 dark:from-orange-400/20 dark:via-amber-300/10 dark:to-yellow-400/8',
    icon: '📄',
  },
  'حریم خصوصی': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    gradient:
      'from-cyan-500/15 via-sky-400/8 to-blue-500/5 dark:from-cyan-400/20 dark:via-sky-300/10 dark:to-blue-400/8',
    icon: '🛡️',
  },
  اخبار: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    gradient:
      'from-green-500/15 via-emerald-400/8 to-teal-500/5 dark:from-green-400/20 dark:via-emerald-300/10 dark:to-teal-400/8',
    icon: '📰',
  },
  قرارداد: {
    bg: 'bg-stone-50 dark:bg-stone-950/40',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-800',
    gradient:
      'from-stone-500/15 via-gray-400/8 to-neutral-500/5 dark:from-stone-400/20 dark:via-gray-300/10 dark:to-neutral-400/8',
    icon: '📋',
  },
  عمومی: {
    bg: 'bg-gray-50 dark:bg-gray-950/40',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    gradient:
      'from-gray-500/15 via-gray-400/8 to-slate-500/5 dark:from-gray-400/20 dark:via-gray-300/10 dark:to-slate-400/8',
    icon: '📌',
  },
  توسعه: {
    bg: 'bg-lime-50 dark:bg-lime-950/40',
    text: 'text-lime-700 dark:text-lime-300',
    border: 'border-lime-200 dark:border-lime-800',
    gradient:
      'from-lime-500/15 via-green-400/8 to-emerald-500/5 dark:from-lime-400/20 dark:via-green-300/10 dark:to-emerald-400/8',
    icon: '💻',
  },
  تقویم: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    gradient:
      'from-yellow-500/15 via-amber-400/8 to-orange-500/5 dark:from-yellow-400/20 dark:via-amber-300/10 dark:to-orange-400/8',
    icon: '📆',
  },
  اعتبارسنجی: {
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-200 dark:border-fuchsia-800',
    gradient:
      'from-fuchsia-500/15 via-purple-400/8 to-pink-500/5 dark:from-fuchsia-400/20 dark:via-purple-300/10 dark:to-pink-400/8',
    icon: '✅',
  },
  آموزش: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    gradient:
      'from-blue-500/15 via-blue-400/8 to-indigo-500/5 dark:from-blue-400/20 dark:via-blue-300/10 dark:to-indigo-400/8',
    icon: '🎓',
  },
  راهنماها: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    gradient:
      'from-purple-500/15 via-violet-400/8 to-fuchsia-500/5 dark:from-purple-400/20 dark:via-violet-300/10 dark:to-fuchsia-400/8',
    icon: '📖',
  },
  متن: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    gradient:
      'from-violet-500/15 via-purple-400/8 to-fuchsia-500/5 dark:from-violet-400/20 dark:via-purple-300/10 dark:to-fuchsia-400/8',
    icon: '📄',
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
  return colors[Math.abs(hash) % colors.length] as string;
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
  const categoryLabel = normalizeCategoryLabel(post.category);
  const seriesLabel = normalizeSeriesLabel(post.series);
  const visibleTags = post.tags.slice(0, 2);
  const categoryColor = CATEGORY_COLORS[categoryLabel] ?? {
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
      <Link
        href={`/blog/${post.slug}`}
        className={`relative block aspect-[1200/630] overflow-hidden bg-gradient-to-br ${categoryColor.gradient}`}
        aria-label={post.title}
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
          <div className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
            <span
              className="text-4xl opacity-50 transition-transform duration-500 group-hover:scale-110"
              aria-hidden="true"
            >
              {categoryColor.icon}
            </span>
            <span className="text-xs font-bold text-[var(--text-secondary)] opacity-70 line-clamp-2 max-w-[200px]">
              {post.title}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--surface-1)]/80 to-transparent" />
      </Link>

      <div className="p-5">
        {isNewest ? (
          <span className="mb-3 inline-flex items-center rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-bold text-white">
            جدیدترین
          </span>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <span
            className={`rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} px-2 py-0.5 text-xs font-semibold`}
          >
            {categoryLabel}
          </span>
          <time dateTime={post.date}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span className="text-[var(--text-muted)]">{readingTime} دقیقه مطالعه</span>
          {(() => {
            const ds = post.difficulty ? DIFFICULTY_STYLES[post.difficulty] : undefined;
            if (!ds) {
              return null;
            }
            return (
              <span
                className={[
                  'rounded-full border px-2 py-0.5 text-xs font-semibold',
                  ds.bg,
                  ds.text,
                  ds.border,
                ].join(' ')}
              >
                {post.difficulty}
              </span>
            );
          })()}
          {seriesLabel ? (
            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
              مجموعه: {seriesLabel}
            </span>
          ) : null}
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
          {visibleTags.map((tag) => (
            <Link key={tag} href={`/blog/tag/${tag}`}>
              <Tag size="sm">{tag}</Tag>
            </Link>
          ))}
          {post.tags.length > visibleTags.length ? (
            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
              +{post.tags.length - visibleTags.length}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={getCategoryRoute(post.category)}
              className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              {categoryLabel}
            </Link>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              مطالعه مقاله
              <span aria-hidden="true">←</span>
            </Link>
          </div>

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
