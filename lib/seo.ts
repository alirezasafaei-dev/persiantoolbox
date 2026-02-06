import type { Metadata } from 'next';

export const siteName = 'جعبه ابزار فارسی';
export const siteDescription =
  'مجموعه کامل و رایگان ابزارهای آنلاین برای کاربران فارسی‌زبان شامل ابزارهای PDF، محاسبات مالی، پردازش تصویر و ابزارهای کاربردی دیگر';
export const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';
export const defaultOgImage = '/og-default.svg';

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
