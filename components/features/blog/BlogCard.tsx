import Link from 'next/link';
import Tag from '@/shared/ui/Tag';
import type { BlogPostMeta } from '@/lib/blog';

type Props = {
  post: BlogPostMeta;
};

export default function BlogCard({ post }: Props) {
  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-fast)] hover:border-[var(--border-strong)]">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <time dateTime={post.date}>{formattedDate}</time>
        <span aria-hidden="true">·</span>
        <Tag variant="primary">{post.category}</Tag>
      </div>
      <h2 className="mt-3 text-lg font-bold text-[var(--text-primary)]">
        <Link href={`/blog/${post.slug}`} className="focus-ring rounded-sm">
          {post.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{post.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Tag key={tag} size="sm">
            {tag}
          </Tag>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          مطالعه مقاله
          <span aria-hidden="true">←</span>
        </Link>
      </div>
    </article>
  );
}
