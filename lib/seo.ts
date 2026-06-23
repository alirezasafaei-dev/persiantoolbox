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
};

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  robots,
}: BuildMetadataInput): Metadata {
  const absoluteUrl = new URL(path, siteUrl).toString();
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

export type HowToStep = {
  name: string;
  text: string;
  image?: string;
};

export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image ? { image: step.image } : {}),
    })),
  };
}

export type ReviewItem = {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
};

export function generateAggregateRatingSchema(
  itemName: string,
  ratingValue: number,
  reviewCount: number,
  bestRating = 5,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue,
      bestRating,
      reviewCount,
    },
  };
}
