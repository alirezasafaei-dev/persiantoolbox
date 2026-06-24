import { siteUrl } from '@/lib/seo';

type Props = {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
};

export default function BlogPostSchema({ title, description, date, author, slug }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: date,
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'جعبه ابزار فارسی',
      logo: `${siteUrl}/icon.svg`,
    },
    url: `${siteUrl}/blog/${slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
