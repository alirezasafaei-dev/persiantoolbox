import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import {
  getPostsByTag,
  getIndexableTagsForStaticParams,
  getTagsWithCount,
  MIN_INDEXABLE_TAG_POSTS,
} from '@/lib/blog';
import BlogList from '@/components/features/blog/BlogList';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { siteUrl } from '@/lib/seo';

type PageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  return getIndexableTagsForStaticParams().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = rawTag.trim();
  const posts = getPostsByTag(tag);
  if (posts.length === 0) {
    return { title: 'برچسب یافت نشد', robots: { index: false, follow: false } };
  }
  if (posts.length < MIN_INDEXABLE_TAG_POSTS) {
    return buildMetadata({
      title: `برچسب «${tag}» - بلاگ جعبه ابزار فارسی`,
      description: `مقاله‌های مرتبط با برچسب «${tag}» در بلاگ جعبه ابزار فارسی (${posts.length} مقاله).`,
      path: `/blog/tag/${tag}`,
      keywords: ['بلاگ', tag, 'جعبه ابزار فارسی'],
      robots: { index: false, follow: true },
    });
  }
  return buildMetadata({
    title: `برچسب «${tag}» - بلاگ جعبه ابزار فارسی`,
    description: `مقاله‌های مرتبط با برچسب «${tag}» در بلاگ جعبه ابزار فارسی (${posts.length} مقاله).`,
    path: `/blog/tag/${tag}`,
    keywords: ['بلاگ', tag, 'جعبه ابزار فارسی'],
  });
}

export default async function BlogTagPage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = rawTag.trim();
  if (tag !== rawTag) {
    permanentRedirect(`/blog/tag/${encodeURIComponent(tag)}`);
  }
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  const relatedTags = getTagsWithCount().slice(0, 12);
  const breadcrumbItems = [
    { name: 'خانه', url: siteUrl },
    { name: 'بلاگ', url: `${siteUrl}/blog` },
    { name: `برچسب: ${tag}`, url: `${siteUrl}/blog/tag/${encodeURIComponent(tag)}` },
  ];

  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema items={breadcrumbItems} />
      <section className="space-y-3">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link href="/blog" className="hover:text-[var(--color-primary)]">
            بلاگ
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--text-secondary)]">برچسب</span>
        </nav>
        <p className="inline-flex items-center rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-primary)]">
          #{tag}
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">برچسب «{tag}»</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          {posts.length} مقاله مرتبط با برچسب «{tag}» در بلاگ جعبه ابزار فارسی.
        </p>
      </section>

      {relatedTags.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">برچسب‌های دیگر:</span>
          {relatedTags.map((t) => (
            <Link
              key={t.tag}
              href={`/blog/tag/${encodeURIComponent(t.tag)}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                t.tag === tag
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
              }`}
            >
              #{t.tag}
              <span className="ms-1 text-[var(--text-muted)]">({t.count})</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <BlogList posts={posts} />
      </div>
    </SiteShell>
  );
}
