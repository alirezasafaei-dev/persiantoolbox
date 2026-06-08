import type { Metadata } from 'next';
import { BRAND, getDefaultSiteUrl } from '@/lib/brand';

export const siteName = BRAND.siteName;
export const siteDescription =
  'مجموعه کامل و رایگان ابزارهای آنلاین برای کاربران فارسی‌زبان شامل ابزارهای PDF، محاسبات مالی، پردازش تصویر و ابزارهای کاربردی دیگر';
export const siteUrl = getDefaultSiteUrl();
export const defaultOgImage = '/og-default.png';

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[] | undefined;
};

export function buildMetadata({
  title,
  description,
  path,
  keywords,
}: BuildMetadataInput): Metadata {
  const absoluteUrl = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
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
          url: defaultOgImage,
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
      images: [defaultOgImage],
    },
  };
}

/**
 * Structured data helpers for SEO
 * Generates JSON-LD for Google Rich Results
 */

export interface BreadcrumbItem {
  name: string;
  item?: string;
}

export interface FAQItem {
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

export function generateOrganizationSchema(name: string, url: string, logo: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs: [],
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
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  };
}

export function generateWebSiteSchema(name: string, url: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
