import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

type Props = {
  tags: string[];
};

export default function ToolBlogCTA({ tags }: Props) {
  const allPosts = getAllPosts();

  const scored = allPosts.map((post) => {
    let score = 0;
    for (const tag of post.tags) {
      const lowerTag = tag.toLowerCase();
      for (const kw of tags) {
        const lowerKw = kw.toLowerCase();
        if (lowerTag.includes(lowerKw) || lowerKw.includes(lowerTag)) {
          score++;
        }
      }
    }
    return { post, score };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.post);

  const display = matched.length > 0 ? matched : allPosts.slice(0, 2);

  if (display.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.05)] p-5 space-y-3">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">مقاله‌های مرتبط</h2>
      <p className="text-sm text-[var(--text-muted)]">
        {matched.length > 0
          ? 'بر اساس موضوع این ابزار، این مقاله‌ها مفید هستند:'
          : 'آخرین مقاله‌های بلاگ را بخوانید:'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {display.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)] transition-colors"
          >
            <div className="flex-1">
              <div className="text-sm font-bold text-[var(--color-primary)]">{post.title}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                {post.description}
              </div>
            </div>
            <span className="text-[var(--color-primary)] mt-1" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
