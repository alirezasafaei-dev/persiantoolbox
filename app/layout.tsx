/* Licensing note: repository is MIT through v1.1.x; planned dual-license policy starts from v2.0.0 (docs/licensing/dual-license-policy.md). */
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { defaultOgImage, siteDescription, siteName, siteUrl } from '@/lib/seo';
import MotionProvider from '@/components/ui/MotionProvider';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import UsageTracker from '@/components/ui/UsageTracker';
import ToastProvider from '@/shared/ui/ToastProvider';
import { getCspNonce } from '@/lib/csp';
import './globals.css';

const googleVerification = process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'];
const verification = googleVerification ? { verification: { google: googleVerification } } : {};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'جعبه ابزار فارسی - ابزارهای آنلاین برای کار و زندگی',
  description: siteDescription,
  keywords: [
    'ابزارهای فارسی',
    'ابزار آنلاین فارسی',
    'تبدیل PDF',
    'محاسبه وام',
    'فشرده سازی عکس',
    'تبدیل آدرس فارسی به انگلیسی',
    'ابزارهای تاریخ',
    'ابزارهای متنی',
    'ابزارهای رایگان',
    'پردازش آفلاین',
    'ابزارهای کاربردی',
    'persian tools',
    'farsi tools',
  ],
  applicationName: siteName,
  authors: [{ name: 'Persian Tools Team' }],
  creator: 'Persian Tools Team',
  openGraph: {
    title: 'جعبه ابزار فارسی - ابزارهای آنلاین برای کار و زندگی',
    description: siteDescription,
    type: 'website',
    locale: 'fa_IR',
    siteName,
    url: siteUrl,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'جعبه ابزار فارسی',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'جعبه ابزار فارسی',
    description: 'ابزارهای آنلاین رایگان برای کاربران فارسی‌زبان',
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...verification,
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.svg',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
  colorScheme: 'light dark',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = await getCspNonce();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
      },
      {
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: 'fa-IR',
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: siteUrl,
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: siteName,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: siteUrl,
        inLanguage: 'fa-IR',
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="/fonts/fonnts.com-IRANSansXRegular.ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="/fonts/fonnts.com-IRANSansXBold.ttf"
          crossOrigin="anonymous"
        />
        <Script
          id="root-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce ?? undefined}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)]">
        <MotionProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            <UsageTracker />
            {children}
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
