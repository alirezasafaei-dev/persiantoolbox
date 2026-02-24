import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SiteShell from '@/components/ui/SiteShell';
import {
  ASDEV_GITHUB_LABEL,
  ASDEV_GITHUB_URL,
  ASDEV_PORTFOLIO_URL,
  ASDEV_SIGNATURE_TEXT,
  ASDEV_SUPPORT_CHAT_LABEL,
  ASDEV_SUPPORT_CHAT_URL,
  ASDEV_TELEGRAM_LABEL,
  ASDEV_TELEGRAM_URL,
  buildAsdevNetworkLinks,
} from '@/lib/asdev-network';

export const metadata: Metadata = {
  title: 'ASDEV | Architecture & Systems DEV',
  description:
    'معرفی رسمی برند ASDEV، توسعه توسط علیرضا صفایی و مسیرهای ارتباطی استاندارد شامل وب‌سایت، GitHub و Telegram.',
  alternates: {
    canonical: 'https://persiantoolbox.ir/asdev',
  },
  openGraph: {
    title: 'ASDEV | Architecture & Systems DEV',
    description: 'صفحه رسمی معرفی ASDEV و مسیرهای ارتباطی حرفه‌ای.',
    url: 'https://persiantoolbox.ir/asdev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASDEV | Architecture & Systems DEV',
    description: 'توسعه توسط علیرضا صفایی با تمرکز روی معماری، کیفیت و پایداری.',
  },
};

const quickLinks = [
  {
    label: 'سایت شخصی و کاری',
    href: ASDEV_PORTFOLIO_URL,
  },
  {
    label: ASDEV_GITHUB_LABEL,
    href: ASDEV_GITHUB_URL,
  },
  {
    label: ASDEV_TELEGRAM_LABEL,
    href: ASDEV_TELEGRAM_URL,
  },
  {
    label: ASDEV_SUPPORT_CHAT_LABEL,
    href: ASDEV_SUPPORT_CHAT_URL,
  },
] as const;

export default function AsdevPage() {
  const networkLinks = buildAsdevNetworkLinks('persiantoolbox', 'asdev_page');

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
              ASDEV | Architecture & Systems DEV
            </span>
            <h1 className="text-4xl font-black leading-tight text-[var(--text-primary)] md:text-5xl">
              معرفی رسمی برند ASDEV
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              ASDEV یک برند فنی برای توسعه سیستم‌های وب قابل اتکا، امن و مقیاس‌پذیر است. این پروژه
              توسط <strong className="text-[var(--text-primary)]">علیرضا صفایی</strong> هدایت و
              توسعه می‌شود.
            </p>
            <div className="flex flex-wrap gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-md"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />

        <section className="section-surface p-6 md:p-8">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">درباره علیرضا صفایی</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
            تمرکز اصلی روی معماری نرم‌افزار، طراحی سیستم، بهبود کیفیت تحویل و ایجاد تجربه کاربری
            فارسیِ دقیق و حرفه‌ای است.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">شبکه رسمی لینک‌ها</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {networkLinks.map((item) => (
              <article
                key={item.label}
                className="card border-[var(--border-light)] p-5 transition-all duration-[var(--motion-fast)] hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]"
              >
                <h3 className="text-base font-black leading-7 text-[var(--text-primary)]">
                  {item.label}
                </h3>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"
                >
                  مشاهده لینک رسمی <span aria-hidden>←</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-surface p-5 md:p-6">
          <p className="text-sm font-semibold text-[var(--text-primary)]">امضای برند</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{ASDEV_SIGNATURE_TEXT}</p>
        </section>
      </Container>
    </SiteShell>
  );
}
