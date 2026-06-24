import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getAllCategories, getPublishedPostsByCategory } from '@/lib/blog';
import BlogList from '@/components/features/blog/BlogList';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const posts = getPublishedPostsByCategory(category);
  if (posts.length === 0) {
    return { title: 'دسته‌بندی یافت نشد', robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: `${category} - بلاگ جعبه ابزار فارسی`,
    description: `مقاله‌های دسته‌بندی ${category} در بلاگ PersianToolbox`,
    path: `/blog/category/${category}`,
    keywords: ['بلاگ', category, 'جعبه ابزار فارسی'],
  });
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const posts = getPublishedPostsByCategory(category);

  if (posts.length === 0) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'خانه', url: siteUrl },
    { name: 'بلاگ', url: `${siteUrl}/blog` },
    { name: category, url: `${siteUrl}/blog/category/${category}` },
  ];

  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema items={breadcrumbItems} />
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          بلاگ
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">{category}</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          مقاله‌های دسته‌بندی «{category}» در بلاگ PersianToolbox.
        </p>
      </section>

      <div className="mt-8">
        <BlogList category={category} />
      </div>
    </SiteShell>
  );
}
