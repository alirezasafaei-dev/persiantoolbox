import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'رزومه ساز آنلاین رایگان | ساخت رزومه فارسی و انگلیسی',
  description:
    'ساخت رزومه فارسی و انگلیسی به صورت آنلاین و رایگان. کاورلتر ساز حرفه‌ای با خروجی PDF و Word.',
  path: '/resume-builder',
  keywords: ['رزومه ساز', 'رزومه آنلاین', 'رزومه فارسی', 'ساخت CV', 'رزومه PDF', 'کاورلتر ساز'],
});

export default function ResumeBuilderPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="resume-builder-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'رزومه ساز آنلاین' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'رزومه ساز آنلاین', url: `${siteUrl}/resume-builder` },
        ]}
      />
      <Script
        id="resume-builder-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا ساخت رزومه رایگان است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، ساخت رزومه کاملاً رایگان است. خروجی HTML و چاپ رایگان است. خروجی PDF و Word در نسخه پریمیوم فعال است.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات رزومه به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات رزومه هرگز از دستگاه خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا رزومه فارسی و انگلیسی پشتیبانی می‌کند؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، هم رزومه فارسی (RTL) و هم رزومه انگلیسی (LTR) با قالب‌های حرفه‌ای پشتیبانی می‌شوند.',
                },
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">رزومه ساز آنلاین</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            ساخت رزومه فارسی و انگلیسی به صورت آنلاین و رایگان. کاورلتر ساز حرفه‌ای با خروجی PDF و
            Word.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h3 className="font-bold text-[var(--text-primary)]">رزومه فارسی</h3>
            <p className="text-xs text-[var(--text-muted)]">
              ساخت رزومه حرفه‌ای فارسی با قالب‌های متنوع
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h3 className="font-bold text-[var(--text-primary)]">رزومه انگلیسی</h3>
            <p className="text-xs text-[var(--text-muted)]">
              ساخت رزومه حرفه‌ای انگلیسی برای فرصت‌های بین‌المللی
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h3 className="font-bold text-[var(--text-primary)]">کاورلتر</h3>
            <p className="text-xs text-[var(--text-muted)]">ساخت نامه پوششی حرفه‌ای همراه رزومه</p>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">ویژگی‌ها</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>قالب‌های حرفه‌ای فارسی و انگلیسی</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>پیش‌نمایش زنده در حین ویرایش</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>خروجی HTML، PDF و Word</span>
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

        <section className="text-center space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/career-tools/resume-builder?type=persian-resume"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
            >
              ساخت رزومه فارسی
            </Link>
            <Link
              href="/career-tools/resume-builder?type=english-resume"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] px-6 py-3 text-sm font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-2)]"
            >
              ساخت رزومه انگلیسی
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
