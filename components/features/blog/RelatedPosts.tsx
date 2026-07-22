import Link from 'next/link';
import type { BlogPostMeta } from '@/lib/blog';
import { normalizeCategoryLabel } from '@/lib/blog-normalize';

type Props = {
  posts: BlogPostMeta[];
};

export default function RelatedPosts({ posts }: Props) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">مقاله‌های مرتبط</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-subtle)]"
          >
            <span className="mb-1 inline-block self-start rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
              {normalizeCategoryLabel(post.category)}
            </span>
            <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-1.5 text-xs text-[var(--text-muted)] leading-5 line-clamp-2 flex-1">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
