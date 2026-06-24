import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogList from '@/components/features/blog/BlogList';
import BlogSidebar from '@/components/features/blog/BlogSidebar';

export const metadata = buildMetadata({
  title: 'بلاگ - جعبه ابزار فارسی',
  description:
    'مقاله‌های آموزشی، راهنماها و نکات کاربردی درباره ابزارهای آنلاین فارسی. آموزش محاسبه حقوق، وام، تبدیل PDF، فشرده‌سازی تصویر و ابزارهای متنی.',
  path: '/blog',
  keywords: [
    'بلاگ جعبه ابزار فارسی',
    'آموزش ابزار آنلاین',
    'مقاله مالی',
    'راهنمای PDF',
    'آموزش محاسبه حقوق',
  ],
});

export default function BlogPage() {
  const total = getAllPosts().length;
  const categories = getAllCategories().length;
  return (
    <SiteShell containerClassName="py-10">
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          بلاگ
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">مقاله‌ها و راهنماها</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          مقاله‌های آموزشی، راهنماها و نکات کاربردی برای استفاده بهتر از ابزارهای PersianToolbox.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[var(--text-muted)]">
          <a
            href="/feed.xml"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <span aria-hidden="true">📡</span>
            خوراک RSS
          </a>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">📚</span>
            {total} مقاله در {categories} دسته
          </span>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_240px]">
        <BlogList />
        <BlogSidebar />
      </div>
    </SiteShell>
  );
}
