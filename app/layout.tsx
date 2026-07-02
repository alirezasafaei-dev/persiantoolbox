/* Licensing note: repository is MIT through v1.1.x; planned dual-license policy starts from v2.0.0 (docs/licensing/dual-license-policy.md). */
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { defaultOgImage, siteDescription, siteName, siteUrl } from '@/lib/seo';
import { BRAND } from '@/lib/brand';
import ToastProvider from '@/shared/ui/ToastProvider';
import ClientRuntimeBoot from '@/components/ui/ClientRuntimeBoot';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import { WebVitals } from '@/components/ui/WebVitals';
import { SmartCTA, ExitIntentPopup } from '@/components/ui/SmartCTA';
import ScrollToTop from '@/components/ui/ScrollToTop';
import QuickToolsFAB from '@/components/ui/QuickToolsFAB';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import './globals.css';

const googleVerification = process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'];
const verification = googleVerification ? { verification: { google: googleVerification } } : {};

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
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
  authors: [{ name: BRAND.ownerName, url: BRAND.ownerSiteUrl }],
  creator: BRAND.masterBrand,
  publisher: BRAND.masterBrand,
  alternates: {
    canonical: siteUrl,
    languages: {
      'fa-IR': siteUrl,
    },
    types: {
      'application/rss+xml': [{ title: 'RSS جعبه ابزار فارسی', url: `${siteUrl}/feed.xml` }],
    },
  },
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
    icon: [
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon-180.png',
    other: [
      { url: '/android-chrome-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512.png', type: 'image/png', sizes: '512x512' },
    ],
  },
  other: {
    'twitter:url': siteUrl,
    enamad: '34914740',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        sameAs: [BRAND.ownerSiteUrl],
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
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://trustseal.enamad.ir" crossOrigin="anonymous" />
        {/* Preload the three critical woff2 fonts used for first paint.
            Fallback fonts (IRANSansX, Noto Sans) lazy-load via font-display: swap. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Vazirmatn-Regular.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Vazirmatn-Bold.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/Vazirmatn-SemiBold.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS جعبه ابزار فارسی"
          href="/feed.xml"
        />
        <Script
          id="root-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)]">
        <ToastProvider>
          <ErrorBoundary>
            <ClientRuntimeBoot />
            <WebVitals />
            <ServiceWorkerRegistration />
            <OfflineIndicator />
            {children}
            <SmartCTA />
            <ExitIntentPopup />
            <ScrollToTop />
            <QuickToolsFAB />
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
