import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import {
  getPostBySlug,
  getAllPostSlugs,
  getRelatedPosts,
  getSeriesProgress,
  isBlogPostVisible,
  normalizeCategoryLabel,
} from '@/lib/blog';
import BlogPost from '@/components/features/blog/BlogPost';
import BlogPostSchema from '@/components/seo/BlogPostSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { siteUrl } from '@/lib/seo';
import { isFeatureEnabled } from '@/lib/features/availability';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type MetadataImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    if (!isBlogPostVisible(post)) {
      return { title: 'مقاله یافت نشد', robots: { index: false, follow: false } };
    }

    let image: MetadataImage | undefined;
    if (post.coverImage) {
      image = {
        url: post.coverImage,
        width: 1200,
        height: 630,
        alt: post.coverAlt || post.title,
      };
    }

    const metadata = {
      title: `${post.title} - جعبه ابزار فارسی`,
      description: post.description,
      path: `/blog/${post.slug}`,
      keywords: [
        'مقاله',
        post.title,
        post.category,
        'جعبه ابزار فارسی',
        'ابزار آنلاین رایگان',
        ...post.tags,
      ],
    };

    return image ? buildMetadata({ ...metadata, image }) : buildMetadata(metadata);
  } catch {
    return { title: 'مقاله یافت نشد', robots: { index: false, follow: false } };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post || !isBlogPostVisible(post)) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);
  const seriesInfo = post.series ? getSeriesProgress(slug) : null;
  const categoryLabel = normalizeCategoryLabel(post.category);
  const breadcrumbItems = [
    { name: 'خانه', url: siteUrl },
    { name: 'بلاگ', url: `${siteUrl}/blog` },
    { name: categoryLabel, url: `${siteUrl}/blog/category/${post.category}` },
    { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
  ];

  return (
    <SiteShell containerClassName="py-10">
      <BlogPostSchema
        title={post.title}
        description={post.description}
        date={post.date}
        modifiedDate={post.modifiedDate}
        author={post.author}
        slug={post.slug}
        coverImage={post.coverImage}
        tags={post.tags}
        wordCount={post.content.split(/\s+/).filter(Boolean).length}
        category={categoryLabel}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <nav
        aria-label="مسیر"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]"
      >
        <Link href="/" className="hover:text-[var(--color-primary)]">
          خانه
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog" className="hover:text-[var(--color-primary)]">
          بلاگ
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/blog/category/${post.category}`}
          className="hover:text-[var(--color-primary)]"
        >
          {categoryLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--text-secondary)]" aria-current="page">
          {post.title}
        </span>
      </nav>
      <BlogPost
        post={post}
        relatedPosts={relatedPosts}
        seriesInfo={seriesInfo}
        adsEnabled={isFeatureEnabled('ads')}
      />
    </SiteShell>
  );
}
