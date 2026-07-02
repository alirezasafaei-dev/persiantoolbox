import Link from 'next/link';
import { getAllCategories, getTagsWithCount, getAllPosts, getPopularPosts } from '@/lib/blog';
import { getIndexableTools } from '@/lib/tools-registry';
import { tagToToolMap } from '@/components/features/blog/BlogToolCTA';

const CATEGORY_ICONS: Record<string, string> = {
  مالی: '💰',
  آموزشی: '📘',
  متنی: '✍️',
  ابزارها: '🧰',
  ابزار: '🧰',
  تاریخ: '📅',
  شغلی: '💼',
  کسب‌وکار: '🏪',
  راهنما: '🔧',
  حقوقی: '⚖️',
  تصویر: '🖼️',
  امنیت: '🔒',
  نگارش: '📝',
  PDF: '📄',
  'حریم خصوصی': '🛡️',
};

type Props = {
  tags?: string[];
};

export default function BlogSidebar({ tags }: Props) {
  const categories = getAllCategories();
  const posts = getAllPosts();
  const totalPosts = posts.length;
  const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0);
  const tagsWithCount = getTagsWithCount().slice(0, 20);
  const popularPosts = getPopularPosts(5);

  const allTools = getIndexableTools().filter((t) => t.kind === 'tool');
  const matchedPaths = new Set<string>();

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      const lowerTag = tag.toLowerCase();
      for (const [key, paths] of Object.entries(tagToToolMap)) {
        if (lowerTag.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTag)) {
          for (const p of paths) {
            matchedPaths.add(p);
          }
        }
      }
    }
  }

  const sidebarTools =
    matchedPaths.size > 0
      ? allTools.filter((t) => matchedPaths.has(t.path)).slice(0, 4)
      : allTools.slice(0, 4);

  const sortedCategories = categories
    .map((cat) => ({
      name: cat,
      count: posts.filter((p) => p.category === cat).length,
      icon: CATEGORY_ICONS[cat] ?? '📄',
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <aside className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">آمار بلاگ</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
            <div className="text-lg font-black text-[var(--color-primary)]">{totalPosts}</div>
            <div className="text-[10px] text-[var(--text-muted)]">مقاله</div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
            <div className="text-lg font-black text-[var(--color-primary)]">
              {Math.round(totalWords / 1000)}K
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">کلمه</div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
            <div className="text-lg font-black text-[var(--color-primary)]">
              {categories.length}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">دسته‌بندی</div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
            <div className="text-lg font-black text-[var(--color-primary)]">
              {tagsWithCount.length}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">موضوع</div>
          </div>
        </div>
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
                      {Math.ceil(post.wordCount / 200)} دقیقه مطالعه
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
        <ul className="space-y-1">
          {sortedCategories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`/blog/category/${cat.name}`}
                className="flex items-center justify-between rounded-sm px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.name}
                </span>
                <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">موضوعات پرتکرار</h3>
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
          {sidebarTools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <span aria-hidden="true">→</span>
              {tool.title.split(' - ')[0]}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
