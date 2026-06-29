import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { DISCLAIMER, PRIVACY_TEXT } from '@/lib/persian-writing/types';

export const metadata = buildMetadata({
  title: 'ابزارهای نگارش فارسی رایگان | پاک‌سازی و استانداردسازی متن',
  description:
    'ابزارهای نگارش فارسی برای پاک‌سازی، استانداردسازی و بهبود متن فارسی. اصلاح حروف عربی، نیم‌فاصله، علائم نگارشی و فاصله‌گذاری.',
  path: '/writing-tools',
  keywords: [
    'ویرایشگر فارسی',
    'پاک‌سازی متن فارسی',
    'اصلاح نگارش فارسی',
    'نرمال‌سازی متن فارسی',
    'استانداردسازی نگارش',
    'نیم‌فاصله',
  ],
});

const faqItems = [
  {
    q: 'آیا ابزارهای نگارش فارسی رایگان هستند؟',
    a: 'بله، ابزارهای پایه رایگان هستند. حالت سخت‌گیرانه و حجم بیشتر از ۵۰۰۰ کاراکتر نیاز به ارتقا دارد.',
  },
  {
    q: 'آیا متن من به سرور ارسال می‌شود؟',
    a: 'خیر، تمام پردازش‌ها در مرورگر انجام می‌شود و متن شما خارج از دستگاه ارسال نمی‌شود.',
  },
  {
    q: 'آیا این ابزار جایگزین ویراستار انسانی است؟',
    a: 'خیر. این ابزار برای بهبود سریع نگارش طراحی شده و جایگزین ویراستار حرفه‌ای نیست.',
  },
  {
    q: 'چه تغییراتی ایجاد می‌شود؟',
    a: 'تبدیل حروف عربی به فارسی، اصلاح فاصله‌گذاری، نیم‌فاصله خودکار، نرمال‌سازی علائم نگارشی و تبدیل اعداد.',
  },
];

export default function WritingToolsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="writing-tools-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'ابزارهای نگارش فارسی' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای نگارش فارسی', url: `${siteUrl}/writing-tools` },
        ]}
      />
      <div className="max-w-4xl mx-auto space-y-10">
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            ابزارهای نگارش فارسی
          </h1>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)] text-sm leading-7">
            پاک‌سازی، استانداردسازی و بهبود نگارش متن فارسی: اصلاح حروف عربی، نیم‌فاصله، علائم
            نگارشی و فاصله‌گذاری. تمام پردازش‌ها در مرورگر انجام می‌شود.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/writing-tools/persian-writing-studio"
            className="block rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.03)] transition-all"
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)]">ویرایشگر فارسی پیشرفته</h2>
            <p className="text-xs text-[var(--text-muted)] mt-2 leading-5">
              پاک‌سازی و استانداردسازی متن فارسی با تنظیمات پیشرفته. تبدیل حروف عربی، نیم‌فاصله
              خودکار، اصلاح علائم نگارشی و تحلیل آمار متن.
            </p>
          </Link>
        </div>

        <section className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-6 space-y-4">
          <h2 className="text-base font-bold text-[var(--color-info)]">سؤالات متداول</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.q}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4"
              >
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.q}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1 leading-5">{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <section className="text-center p-5 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]">
            <p className="text-xs text-[var(--text-muted)] leading-5 max-w-2xl mx-auto">
              {DISCLAIMER}
            </p>
          </section>
          <section className="text-center p-5 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]">
            <p className="text-xs text-[var(--text-muted)] leading-5 max-w-2xl mx-auto">
              {PRIVACY_TEXT}
            </p>
          </section>
        </section>
      </div>
    </SiteShell>
  );
}
