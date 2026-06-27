import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'ویرایشگر فارسی آنلاین | پاک‌سازی و استانداردسازی متن',
  description:
    'ویرایشگر فارسی آنلاین برای پاک‌سازی و استانداردسازی متن. اصلاح حروف عربی، نیم‌فاصله، علائم نگارشی و فاصله‌گذاری.',
  path: '/persian-editor',
  keywords: ['ویرایشگر فارسی', 'پاک‌سازی متن فارسی', 'اصلاح نگارش فارسی', 'نرمال‌سازی متن'],
});

export default function PersianEditorPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="persian-editor-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'ویرایشگر فارسی' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ویرایشگر فارسی', url: `${siteUrl}/persian-editor` },
        ]}
      />
      <Script
        id="persian-editor-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'ویرایشگر فارسی چه کاری انجام می‌دهد؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'اصلاح حروف عربی به فارسی، نیم‌فاصله، علائم نگارشی، فاصله‌گذاری و آمار متن.',
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
          <h1 className="text-3xl font-black text-[var(--text-primary)]">ویرایشگر فارسی آنلاین</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            پاک‌سازی و استانداردسازی متن فارسی به صورت آنلاین و رایگان. اصلاح حروف عربی، نیم‌فاصله،
            علائم نگارشی و فاصله‌گذاری.
          </p>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">قابلیت‌ها</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح حروف عربی به فارسی (ي → ی ، ك → ک)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح خودکار نیم فاصله</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح علائم نگارشی (، ؛ : ! ?)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>اصلاح فاصله‌گذاری</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>آمار متن (تعداد کلمات، کاراکترها)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>حفظ URL، ایمیل و شماره تلفن</span>
            </li>
          </ul>
        </section>

        <section className="text-center">
          <Link
            href="/writing-tools/persian-writing-studio"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
          >
            شروع ویرایش متن
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
