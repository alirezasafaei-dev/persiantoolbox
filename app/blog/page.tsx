import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogList from '@/components/features/blog/BlogList';
import BlogSidebar from '@/components/features/blog/BlogSidebar';
import BlogEditorial from '@/components/features/blog/BlogEditorial';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'بلاگ - بیش از ۱۰۰ مقاله آموزشی ابزار آنلاین فارسی',
  description:
    'بیش از ۱۰۰ مقاله آموزشی و راهنمای کاربردی درباره محاسبه حقوق، وام، مالیات، PDF، رزومه، ویرایش متن فارسی و ابزارهای آنلاین رایگان.',
  path: '/blog',
  keywords: [
    'بلاگ جعبه ابزار فارسی',
    'آموزش ابزار آنلاین',
    'مقاله مالی فارسی',
    'راهنمای PDF',
    'آموزش محاسبه حقوق',
    'آموزش ویرایش فارسی',
    'راهنمای رزومه‌نویسی',
    'ابزار آنلاین رایگان',
  ],
});

export default function BlogPage() {
  const posts = getAllPosts();
  const total = posts.length;
  const categories = getAllCategories().length;
  const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'مقاله‌ها و راهنماها - جعبه ابزار فارسی',
    description:
      'بیش از ۱۰۰ مقاله آموزشی، راهنما و نکات کاربردی درباره ابزارهای آنلاین فارسی؛ محاسبه حقوق، وام، PDF، رزومه و ویرایش متن.',
    url: `${siteUrl}/blog`,
    hasPart: posts.slice(0, 20).map((post) => ({
      '@type': 'Article',
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
      dateModified: post.modifiedDate,
      author: { '@type': 'Person', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'جعبه ابزار فارسی',
        logo: `${siteUrl}/logo.png`,
      },
      ...(post.coverImage ? { image: new URL(post.coverImage, siteUrl).toString() } : {}),
    })),
  };

  return (
    <SiteShell containerClassName="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          بلاگ
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">مقاله‌ها و راهنماها</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          بیش از {total} مقاله آموزشی در {categories} دسته‌بندی؛ از محاسبه حقوق و وام تا ویرایش متن
          فارسی و مدیریت اسناد PDF.
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
            {total} مقاله · {Math.round(totalWords / 1000)}K+ کلمه · {categories} دسته
          </span>
        </div>
      </section>

      {/* Editorial Layout */}
      <div className="mt-8">
        <BlogEditorial />
      </div>

      {/* Full List with Sidebar */}
      <div className="mt-12 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <BlogList />
        </div>
        <BlogSidebar />
      </div>
    </SiteShell>
  );
}
