import Link from 'next/link';
import { getAllCategories, getAllTags, getAllPosts } from '@/lib/blog';

export default function BlogSidebar() {
  const categories = getAllCategories();
  const tags = getAllTags();
  const posts = getAllPosts();
  const totalPosts = posts.length;

  return (
    <aside className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">آمار</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {totalPosts} مقاله منتشر شده
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">دسته‌بندی‌ها</h3>
        <ul className="space-y-1.5">
          {categories.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <li key={cat}>
                <Link
                  href={`/blog/category/${cat}`}
                  className="flex items-center justify-between rounded-sm px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                >
                  <span>{cat}</span>
                  <span className="text-[var(--text-muted)]">{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">تگ‌ها</h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
