import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, getSeriesProgress } from '@/lib/blog';
import BlogPost from '@/components/features/blog/BlogPost';
import BlogPostSchema from '@/components/seo/BlogPostSchema';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    if (!post.published) {
      return { title: 'مقاله یافت نشد', robots: { index: false, follow: false } };
    }
    return buildMetadata({
      title: `${post.title} - جعبه ابزار فارسی`,
      description: post.description,
      path: `/blog/${post.slug}`,
      keywords: ['مقاله', post.title, post.category, ...post.tags],
    });
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

  if (!post?.published) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);
  const seriesInfo = post.series ? getSeriesProgress(slug) : null;

  return (
    <SiteShell containerClassName="py-10">
      <BlogPostSchema
        title={post.title}
        description={post.description}
        date={post.date}
        author={post.author}
        slug={post.slug}
      />
      <BlogPost post={post} relatedPosts={relatedPosts} seriesInfo={seriesInfo} />
    </SiteShell>
  );
}
