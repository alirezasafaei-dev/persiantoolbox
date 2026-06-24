import Link from 'next/link';
import Tag from '@/shared/ui/Tag';
import type { BlogPostMeta } from '@/lib/blog';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  آموزشی: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  اخبار: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  راهنما: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
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
  };

  return (
    <article className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-medium)] hover:scale-[1.01] hover:shadow-[var(--shadow-strong)] hover:border-[var(--border-medium)]">
      {post.coverImage ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-1)] via-[var(--surface-1)]/40 to-transparent" />
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-[var(--surface-2)]" />
      )}

      <div className="p-5">
        {isNewest && (
          <span className="mb-3 inline-flex items-center rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-bold text-white">
            جدیدترین
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={post.date}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span
            className={`rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} px-2 py-0.5 text-xs font-semibold`}
          >
            {post.category}
          </span>
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
            <Tag key={tag} size="sm">
              {tag}
            </Tag>
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
