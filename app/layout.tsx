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
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import ClientOverlays from '@/components/ui/ClientOverlays';
import { getCspNonce } from '@/lib/csp';
import './globals.css';

const googleVerification = process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'];
const googleAnalyticsId = process.env['NEXT_PUBLIC_GOOGLE_ANALYTICS_ID']?.trim() ?? 'G-KRMGLP8TXP';
const gtmId = process.env['NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID']?.trim() ?? '';
const verification = googleVerification ? { verification: { google: googleVerification } } : {};

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  metadataBase: new URL(siteUrl),
  title: 'جعبه ابزار فارسی | ابزار آنلاین فارسی',
  description: siteDescription,
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = await getCspNonce();
  const nonceAttr = nonce ?? undefined;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        sameAs: [
          BRAND.ownerSiteUrl,
          'https://twitter.com/persiantoolbox',
          'https://github.com/parsairaniiidev/persiantoolbox',
          'https://www.linkedin.com/company/persiantoolbox',
          'https://youtube.com/@persiantoolbox',
          'https://t.me/persiantoolbox',
        ],
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
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://trustseal.enamad.ir" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
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
          nonce={nonceAttr}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {googleAnalyticsId ? (
          <>
            <Script id="consent-defaults" strategy="beforeInteractive" nonce={nonceAttr}>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied'
                });
              `}
            </Script>
            <Script
              id="google-analytics"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-config" strategy="afterInteractive" nonce={nonceAttr}>
              {`
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        ) : null}
        {gtmId ? (
          <Script
            id="google-tag-manager"
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)]">
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              title="Google Tag Manager"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--bg-primary)] focus:p-2 focus:rounded"
        >
          رد شدن به محتوای اصلی
        </a>
        <ToastProvider>
          <ErrorBoundary>
            <ClientRuntimeBoot />
            <WebVitals />
            <ServiceWorkerRegistration />
            <OfflineIndicator />
            {children}
            <ClientOverlays />
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
