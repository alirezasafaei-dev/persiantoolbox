import Link from 'next/link';
import Tag from '@/shared/ui/Tag';
import type { BlogPost as BlogPostType } from '@/lib/blog';
import { getRelatedPosts } from '@/lib/blog';

type Props = {
  post: BlogPostType;
};

export default function BlogPostComponent({ post }: Props) {
  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const relatedPosts = getRelatedPosts(post.slug, 3);

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          <span aria-hidden="true">→</span>
          بازگشت به بلاگ
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={post.date}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span>{post.author}</span>
          <span aria-hidden="true">·</span>
          <Tag variant="primary">{post.category}</Tag>
        </div>
        <h1 className="text-3xl font-black leading-tight text-[var(--text-primary)]">
          {post.title}
        </h1>
        <p className="text-sm leading-7 text-[var(--text-secondary)]">{post.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Tag key={tag} size="sm">
              {tag}
            </Tag>
          ))}
        </div>
      </header>

      <div
        className="prose prose-sm prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-[var(--color-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-[var(--color-primary)] prose-pre:bg-[var(--surface-2)] prose-pre:border prose-pre:border-[var(--border-light)] max-w-none text-[var(--text-secondary)] leading-8 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_li]:text-[var(--text-secondary)] [&_ol]:space-y-2 [&_table]:w-full [&_th]:border [&_th]:border-[var(--border-light)] [&_th]:bg-[var(--surface-2)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-sm [&_th]:font-semibold [&_th]:text-[var(--text-primary)] [&_td]:border [&_td]:border-[var(--border-light)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-[var(--text-secondary)] [&_ul]:space-y-2"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {relatedPosts.length > 0 && (
        <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">مقاله‌های مرتبط</h2>
          <ul className="space-y-2">
            {relatedPosts.map((rp) => (
              <li key={rp.slug}>
                <Link
                  href={`/blog/${rp.slug}`}
                  className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                >
                  {rp.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
