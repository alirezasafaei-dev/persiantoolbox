import type { Metadata } from 'next';
import { BRAND, getDefaultSiteUrl } from '@/lib/brand';

export const siteName = BRAND.siteName;
export const siteDescription =
  'مجموعه کامل و رایگان ابزارهای آنلاین برای کاربران فارسی‌زبان شامل ابزارهای PDF، محاسبات مالی، پردازش تصویر و ابزارهای کاربردی دیگر';
export const siteUrl = getDefaultSiteUrl();
export const defaultOgImage = `${getDefaultSiteUrl()}/og-default.png`;

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[] | undefined;
  robots?: { index?: boolean; follow?: boolean } | undefined;
  image?: string | undefined;
};

function inferBlogImage(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 2 || segments[0] !== 'blog') {
    return undefined;
  }

  const slug = segments[1];
  if (!slug || ['bookmarks', 'category', 'tag'].includes(slug)) {
    return undefined;
  }

  return `/images/blog/${slug}.svg`;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  robots,
  image,
}: BuildMetadataInput): Metadata {
  const absoluteUrl = new URL(path, siteUrl).toString();
  const inferredImage = image ?? inferBlogImage(path);
  const resolvedImage = inferredImage ? new URL(inferredImage, siteUrl).toString() : defaultOgImage;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    ...(robots ? { robots } : {}),
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName,
      locale: 'fa_IR',
      type: 'website',
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedImage],
    },
  };
}

/**
 * Structured data helpers for SEO
 * Generates JSON-LD for Google Rich Results
 */

interface BreadcrumbItem {
  name: string;
  item?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function generateSoftwareApplicationSchema(
  name: string,
  description: string,
  url: string,
  operatingSystem = 'Web',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IRR',
    },
  };
}
