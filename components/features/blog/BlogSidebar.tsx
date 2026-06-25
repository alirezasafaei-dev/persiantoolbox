import Link from 'next/link';
import { getAllCategories, getTagsWithCount, getAllPosts, getPopularPosts } from '@/lib/blog';

export default function BlogSidebar() {
  const categories = getAllCategories();
  const posts = getAllPosts();
  const totalPosts = posts.length;
  const tagsWithCount = getTagsWithCount().slice(0, 20);
  const popularPosts = getPopularPosts(5);

  return (
    <aside className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">آمار</h3>
        <p className="text-xs text-[var(--text-secondary)]">{totalPosts} مقاله منتشر شده</p>
      </div>

      {popularPosts.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
          <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">محبوب‌ترین مقاله‌ها</h3>
          <ol className="space-y-3">
            {popularPosts.map((post, index) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3 rounded-sm p-1 text-right transition-colors hover:bg-[var(--surface-2)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                      {post.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(post.date).toLocaleDateString('fa-IR', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

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
          {tagsWithCount.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
            >
              {tag}
              <span className="text-[10px] opacity-70">{count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">ابزارهای پیشنهادی</h3>
        <div className="space-y-2">
          {[
            { name: 'محاسبه حقوق و دستمزد', path: '/tools/tax-calculator' },
            { name: 'تبدیل PDF به Word', path: '/pdf-tools/convert/pdf-to-word' },
            { name: 'ساخت QR Code', path: '/text-tools/qr-code' },
            { name: 'حذف پس‌زمینه تصویر', path: '/image-tools/image-background-remover' },
          ].map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <span aria-hidden="true">→</span>
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
