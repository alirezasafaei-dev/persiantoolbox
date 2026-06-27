import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'اصلاح نیم فاصله آنلاین | اصلاح زبانی متن فارسی',
  description:
    'اصلاح نیم فاصله متن فارسی به صورت آنلاین و رایگان. اصلاح خودکار زبانی، فاصله‌گذاری و علائم نگارشی.',
  path: '/zwnj-correction',
  keywords: [
    'نیم فاصله',
    'اصلاح نیم فاصله',
    'نیم فاصله آنلاین',
    'اصلاح زبانی',
    'فاصله‌گذاری فارسی',
  ],
});

export default function ZwnjCorrectionPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="zwnj-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'اصلاح نیم فاصله' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'اصلاح نیم فاصله', url: `${siteUrl}/zwnj-correction` },
        ]}
      />
      <Script
        id="zwnj-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'نیم فاصله چیست؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'نیم فاصله (ZWNJ) کاراکتری است که در متن فارسی برای جداسازی کلمات مرکب استفاده می‌شود. مثلاً "خود‌رو" به جای "خودرو".',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اصلاح نیم فاصله رایگان است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، استفاده پایه رایگان است. نسخه حرفه‌ای حالت سخت‌گیرانه و محدودیت کاراکتر بیشتری ارائه می‌دهد.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا متن من به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. متن شما هرگز از دستگاه خارج نمی‌شود.',
                },
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">اصلاح نیم فاصله آنلاین</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            اصلاح خودکار نیم فاصله در متن فارسی. ابزار رایگان ویرایشگر فارسی برای بهبود کیفیت نگارش.
          </p>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">ویژگی‌ها</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح خودکار نیم فاصله در متن فارسی</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح حروف عربی به فارسی (ي → ی ، ك → ک)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح فاصله‌گذاری و علائم نگارشی</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>پردازش کاملاً محلی در مرورگر</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>بدون نیاز به ثبت‌نام</span>
            </li>
          </ul>
        </section>

        <section className="text-center">
          <Link
            href="/writing-tools/persian-writing-studio"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
          >
            شروع اصلاح متن
          </Link>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">نکات نگارشی فارسی</h2>
          <div className="text-sm text-[var(--text-secondary)] space-y-3 leading-7">
            <p>
              <strong>نیم فاصله (ZWNJ):</strong> کاراکتری که برای جداسازی کلمات مرکب استفاده می‌شود.
              مثلاً: خود‌رو، روز‌نامه، امروز.
            </p>
            <p>
              <strong>حروف عربی به فارسی:</strong> ي → ی ، ك → ک ، ة → ه ، ء → ئ
            </p>
            <p>
              <strong>فاصله‌گذاری:</strong> فاصله اضافی بین کلمات حذف شده و فاصله صحیح اعمال می‌شود.
            </p>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
