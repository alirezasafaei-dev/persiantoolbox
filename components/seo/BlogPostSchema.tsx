import { siteUrl } from '@/lib/seo';

type Props = {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
  coverImage?: string;
  tags?: string[];
  modifiedDate?: string;
  wordCount?: number;
  category?: string;
};

export default function BlogPostSchema({
  title,
  description,
  date,
  author,
  slug,
  coverImage,
  tags,
  modifiedDate,
  wordCount,
  category,
}: Props) {
  const url = `${siteUrl}/blog/${slug}`;
  const image = coverImage ? new URL(coverImage, siteUrl).toString() : `${siteUrl}/og-default.png`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date,
    dateModified: modifiedDate ?? date,
    image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      name: author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'جعبه ابزار فارسی',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    url,
    ...(category ? { articleSection: category } : {}),
    ...(wordCount && wordCount > 0 ? { wordCount } : {}),
    ...(tags && tags.length > 0 ? { keywords: tags.join(', ') } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
