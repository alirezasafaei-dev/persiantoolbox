import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import {
  ASDEV_PORTFOLIO_LABEL,
  ASDEV_PORTFOLIO_URL,
  ASDEV_SIGNATURE_TEXT,
  ASDEV_TELEGRAM_URL,
  buildAsdevNetworkLinks,
} from '@/lib/asdev-network';

export const metadata: Metadata = {
  title: 'ASDEV — شبکه محصولات و همکاری',
  description: 'صفحه برند ASDEV با لینک‌های رسمی: پورتفولیو، PersianToolbox و Audit IR.',
  alternates: {
    canonical: 'https://persiantoolbox.ir/asdev',
  },
  openGraph: {
    title: 'ASDEV | شبکه محصولات',
    description: 'لینک‌دهی متقابل بین پورتفولیو، PersianToolbox و Audit IR برای همکاری و تماس.',
    url: 'https://persiantoolbox.ir/asdev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASDEV — شبکه محصولات',
    description: 'لینک‌های رسمی ASDEV برای همکاری و تماس.',
  },
  other: { 'x-robots-tag': 'index, follow' },
};

export default function AsdevPage() {
  const networkLinks = buildAsdevNetworkLinks('persiantoolbox', 'asdev_page').map((item) => {
    if (item.key === 'portfolio') {
      return {
        ...item,
        desc: 'معرفی، خدمات و راه‌های تماس با علیرضا صفایی.',
      };
    }
    if (item.key === 'toolbox') {
      return {
        ...item,
        desc: 'مجموعه ابزار فارسی با پردازش لوکال و احترام به حریم خصوصی.',
      };
    }
    return {
      ...item,
      desc: 'پلتفرم Audit برای Performance/SEO/Security با گزارش عملیاتی.',
    };
  });

  const contactLinks = [
    { label: 'GitHub', href: 'https://github.com/alirezasafaeisystems' },
    { label: 'Telegram', href: ASDEV_TELEGRAM_URL },
    { label: 'Portfolio & contact', href: ASDEV_PORTFOLIO_URL },
  ];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'آیا لینک‌ها امن و رهگیری‌شده هستند؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'لینک‌ها با پارامتر UTM استاندارد ثبت شده‌اند و فقط به دامنه‌های رسمی ASDEV اشاره می‌کنند.',
        },
      },
      {
        '@type': 'Question',
        name: 'چطور به پشتیبانی مستقیم برسم؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'از کانال رسمی تلگرام https://t.me/asdevsystems یا صفحه پورتفولیو برای تماس مستقیم استفاده کنید.',
        },
      },
    ],
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--surface-1)]">
      <main className="flex-1">
        <Container className="py-12 space-y-8">
          <header className="space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              ASDEV | Architecture & Systems DEV
            </p>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">ASDEV — علیرضا صفایی</h1>
            <p className="text-[var(--text-secondary)] leading-7">
              معرفی کوتاه برند ASDEV و لینک‌های رسمی شبکه شامل پورتفولیو، PersianToolbox و Audit IR.
            </p>
          </header>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
          />

          <section className="grid gap-4 md:grid-cols-3">
            {networkLinks.map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] p-4 shadow-sm space-y-2"
              >
                <h2 className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                  {item.label}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-6">{item.desc}</p>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[var(--accent)] inline-flex items-center gap-1"
                >
                  مشاهده <span aria-hidden>→</span>
                </Link>
              </article>
            ))}
          </section>

          <section className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] p-4 space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">امضای برند</h2>
            <p className="text-sm text-[var(--text-secondary)]">{ASDEV_SIGNATURE_TEXT}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              <Link
                href={ASDEV_PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {ASDEV_PORTFOLIO_LABEL}
              </Link>
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
              {contactLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
