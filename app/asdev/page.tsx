import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';

const utmSource = 'persiantoolbox';

function withUtm(baseUrl: string, content: 'footer' | 'asdev_page') {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', utmSource);
  url.searchParams.set('utm_medium', 'cross_site');
  url.searchParams.set('utm_campaign', 'asdev_network');
  url.searchParams.set('utm_content', content);
  return url.toString();
}

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
};

export default function AsdevPage() {
  const networkLinks = [
    {
      label: 'پورتفولیو و راه‌های ارتباطی',
      href: withUtm('https://alirezasafaeisystems.ir/', 'asdev_page'),
      desc: 'معرفی، خدمات و راه‌های تماس با علیرضا صفایی.',
    },
    {
      label: 'PersianToolbox — ابزارهای فارسی (لوکال و امن)',
      href: withUtm('https://persiantoolbox.ir/', 'asdev_page'),
      desc: 'مجموعه ابزار فارسی با پردازش لوکال و احترام به حریم خصوصی.',
    },
    {
      label: 'Audit IR — بررسی فنی و امنیتی',
      href: withUtm('https://audit.alirezasafaeisystems.ir/', 'asdev_page'),
      desc: 'پلتفرم Audit برای Performance/SEO/Security با گزارش عملیاتی.',
    },
  ];

  const contactLinks = [
    { label: 'GitHub', href: 'https://github.com/alirezasafaeisystems' },
    { label: 'Telegram', href: 'https://t.me/asdevsystems' },
    { label: 'Portfolio & contact', href: 'https://alirezasafaeisystems.ir/' },
  ];

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
            <p className="text-sm text-[var(--text-secondary)]">
              ASDEV | Alireza Safaei — علیرضا صفایی
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Portfolio &amp; contact:{' '}
              <Link
                href="https://alirezasafaeisystems.ir/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                alirezasafaeisystems.ir
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
