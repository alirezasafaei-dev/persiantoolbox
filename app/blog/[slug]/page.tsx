import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import { getCspNonce } from '@/lib/csp';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';
import BlogPost from '@/components/features/blog/BlogPost';

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
  const nonce = await getCspNonce();

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post?.published) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    inLanguage: 'fa-IR',
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    keywords: post.tags.join(', '),
  };

  return (
    <SiteShell containerClassName="py-10">
      <BlogPost post={post} />

      <Script
        id={`blog-jsonld-${post.slug}`}
        strategy="afterInteractive"
        type="application/ld+json"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </SiteShell>
  );
}
