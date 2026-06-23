import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogCard from './BlogCard';

type Props = {
  category?: string;
};

export default function BlogList({ category }: Props) {
  const allPosts = getAllPosts();
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;
  const categories = getAllCategories();

  if (posts.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          {category ? `مقاله‌ای در دسته «${category}» یافت نشد.` : 'هنوز مقاله‌ای منتشر نشده است.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {category && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">دسته: {category}</h2>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            مشاهده همه
          </Link>
        </div>
      )}
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
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
