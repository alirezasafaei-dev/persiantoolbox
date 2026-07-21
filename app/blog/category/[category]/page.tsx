import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getAllCategories, getPublishedPostsByCategory, normalizeCategoryLabel } from '@/lib/blog';
import BlogList from '@/components/features/blog/BlogList';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

export const revalidate = 300;

type PageProps = {
  params: Promise<{ category: string }>;
};

function decodeCategoryParam(category: string): string {
  try {
    return decodeURIComponent(category);
  } catch {
    return category;
  }
}

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rawParams = await params;
  const category = decodeCategoryParam(rawParams.category);
  const categoryLabel = normalizeCategoryLabel(category);
  const posts = getPublishedPostsByCategory(category);
  if (posts.length === 0) {
    return { title: 'دسته‌بندی یافت نشد', robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: `${categoryLabel} - بلاگ جعبه ابزار فارسی`,
    description: `مقاله‌های دسته‌بندی ${categoryLabel} در بلاگ جعبه ابزار فارسی`,
    path: `/blog/category/${encodeURIComponent(category)}`,
    keywords: ['بلاگ', category, 'جعبه ابزار فارسی'],
  });
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const rawParams = await params;
  const category = decodeCategoryParam(rawParams.category);
  const categoryLabel = normalizeCategoryLabel(category);
  const posts = getPublishedPostsByCategory(category);

  if (posts.length === 0) {
    notFound();
  }

  const categoryPath = `/blog/category/${encodeURIComponent(category)}`;
  const breadcrumbItems = [
    { name: 'خانه', url: siteUrl },
    { name: 'بلاگ', url: `${siteUrl}/blog` },
    { name: categoryLabel, url: `${siteUrl}${categoryPath}` },
  ];

  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema items={breadcrumbItems} />
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          بلاگ
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">{categoryLabel}</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          مقاله‌های دسته‌بندی «{categoryLabel}» در بلاگ جعبه ابزار فارسی.
        </p>
      </section>

      <div className="mt-8">
        <BlogList category={category} />
      </div>
    </SiteShell>
  );
}
