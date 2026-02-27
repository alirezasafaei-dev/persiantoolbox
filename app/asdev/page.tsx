import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SiteShell from '@/components/ui/SiteShell';
import {
  ASDEV_GITHUB_URL,
  ASDEV_PORTFOLIO_URL,
  ASDEV_SUPPORT_CHAT_URL,
  ASDEV_TELEGRAM_URL,
} from '@/lib/asdev-network';

export const metadata: Metadata = {
  title: 'علیرضا صفایی مهندس سیستم های وب',
  description:
    'معرفی علیرضا صفایی مهندس سیستم های وب با تمرکز بر معماری نرم‌افزار، طراحی سیستم و کیفیت تحویل.',
  alternates: {
    canonical: 'https://persiantoolbox.ir/asdev',
  },
  openGraph: {
    title: 'علیرضا صفایی مهندس سیستم های وب',
    description: 'تمرکز اصلی روی معماری نرم‌افزار، طراحی سیستم و ارائه تجربه کاربری فارسی حرفه‌ای.',
    url: 'https://persiantoolbox.ir/asdev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'علیرضا صفایی مهندس سیستم های وب',
    description: 'توسعه توسط علیرضا صفایی با تمرکز روی معماری، کیفیت و پایداری.',
  },
};

export default function AsdevPage() {
  const organizationLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'ASDEV',
        alternateName: 'Architecture & Systems DEV',
        url: ASDEV_PORTFOLIO_URL,
        sameAs: [ASDEV_GITHUB_URL, ASDEV_TELEGRAM_URL, ASDEV_SUPPORT_CHAT_URL],
      },
      {
        '@type': 'Person',
        name: 'علیرضا صفایی',
        url: ASDEV_PORTFOLIO_URL,
        worksFor: {
          '@type': 'Organization',
          name: 'ASDEV',
        },
      },
      {
        '@type': 'WebPage',
        name: 'ASDEV | معرفی برند',
        url: 'https://persiantoolbox.ir/asdev',
        inLanguage: 'fa-IR',
      },
    ],
  };

  return (
    <SiteShell withContainer={false}>
      <Container className="space-y-8 py-10 md:py-12">
        <header className="section-surface relative overflow-hidden p-6 md:p-10">
          <div className="pointer-events-none absolute -top-28 right-16 h-48 w-48 rounded-full bg-[rgb(var(--color-primary-rgb)/0.18)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] blur-3xl" />
          <div className="relative space-y-5">
            <span className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
              Alireza Safaei | Web Systems Engineering
            </span>
            <h1 className="text-4xl font-black leading-tight text-[var(--text-primary)] md:text-5xl">
              علیرضا صفایی مهندس سیستم های وب
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              تمرکز اصلی روی معماری نرم‌افزار، طراحی سیستم، بهبود کیفیت تحویل و ایجاد تجربه کاربری
              فارسیِ دقیق و حرفه‌ای است.
            </p>
          </div>
        </header>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />

        <section className="section-surface p-6 md:p-8">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">درباره علیرضا صفایی</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
            برای کسب اطلاعات و نحوه همکاری و دیدن نمونه کارها به وبسایت من مراجعه کنین.
          </p>
          <div className="mt-4">
            <Link
              href="https://alirezasafaeisystems.ir/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-md"
            >
              ورود به وبسایت رسمی
            </Link>
          </div>
        </section>
      </Container>
    </SiteShell>
  );
}
