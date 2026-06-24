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
}: Props) {
  const url = `${siteUrl}/blog/${slug}`;
  const image = coverImage ? new URL(coverImage, siteUrl).toString() : `${siteUrl}/og-default.png`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'جعبه ابزار فارسی',
      logo: `${siteUrl}/icon.svg`,
    },
    url,
    ...(tags && tags.length > 0 ? { keywords: tags.join(', ') } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
