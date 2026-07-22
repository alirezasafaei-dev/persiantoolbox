import type { Metadata } from 'next';
import { BRAND, getDefaultSiteUrl } from '@/lib/brand';

export const siteName = BRAND.siteName;
export const siteDescription =
  'جعبه ابزار فارسی — مجموعه کامل ابزارهای آنلاین رایگان فارسی: محاسبه وام و حقوق، تبدیل تاریخ شمسی، فشرده‌سازی PDF، OCR فارسی، ساخت فاکتور و رزومه، ویرایشگر متن فارسی. تمام پردازش‌ها در مرورگر شما انجام می‌شود — داده‌ها از دستگاه خارج نمی‌شوند.';
export const siteUrl = getDefaultSiteUrl();
export const defaultOgImage = `${getDefaultSiteUrl()}/og-default.png`;

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[] | undefined;
  robots?: { index?: boolean; follow?: boolean } | undefined;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  robots,
  image,
}: BuildMetadataInput): Metadata {
  const absoluteUrl = new URL(path, siteUrl).toString();
  const metadataImage = {
    url: defaultOgImage,
    width: 1200,
    height: 630,
    alt: title,
  };

  if (image?.url) {
    metadataImage.url = new URL(image.url, siteUrl).toString();
    metadataImage.width = image.width ?? 1200;
    metadataImage.height = image.height ?? 630;
    metadataImage.alt = image.alt ?? title;
  }

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
      images: [metadataImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [metadataImage.url],
    },
    other: {
      'twitter:url': absoluteUrl,
    },
  };
}
