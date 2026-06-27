import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'فاکتورساز آنلاین رایگان | ساخت فاکتور و رسید',
  description:
    'ساخت فاکتور فروش، پیش‌فاکتور و رسید دریافت وجه به صورت آنلاین و رایگان. خروجی PDF و Word با طراحی حرفه‌ای.',
  path: '/invoice-maker',
  keywords: ['فاکتورساز', 'فاکتور آنلاین', 'ساخت فاکتور', 'فاکتور PDF', 'رسید دریافت وجه'],
});

export default function InvoiceMakerPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="invoice-maker-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'فاکتورساز آنلاین' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'فاکتورساز آنلاین', url: `${siteUrl}/invoice-maker` },
        ]}
      />
      <Script
        id="invoice-maker-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا ساخت فاکتور رایگان است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، ساخت فاکتور کاملاً رایگان است. خروجی HTML و چاپ رایگان است. خروجی PDF و Word در نسخه پریمیوم فعال است.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات فاکتور به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات فاکتور هرگز از دستگاه خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'چه نوع فاکتورهایی ساخته می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'فاکتور فروش، پیش‌فاکتور (Proforma) و رسید دریافت وجه. هر سه با قالب حرفه‌ای و قابل چاپ.',
                },
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">فاکتورساز آنلاین</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            ساخت فاکتور فروش، پیش‌فاکتور و رسید دریافت وجه به صورت آنلاین و رایگان. خروجی PDF و Word
            با طراحی حرفه‌ای.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h3 className="font-bold text-[var(--text-primary)]">فاکتور فروش</h3>
            <p className="text-xs text-[var(--text-muted)]">
              ساخت فاکتور رسمی برای فروش کالا و خدمات
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h3 className="font-bold text-[var(--text-primary)]">پیش‌فاکتور</h3>
            <p className="text-xs text-[var(--text-muted)]">ساخت پیش‌فاکتور برای ارائه به مشتری</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h3 className="font-bold text-[var(--text-primary)]">رسید دریافت وجه</h3>
            <p className="text-xs text-[var(--text-muted)]">ساخت رسید برای تأیید دریافت وجه</p>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">ویژگی‌ها</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>محاسبه خودکار مالیات و تخفیف</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>پشتیبانی از ارز ریال و تومان</span>
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

        <section className="text-center">
          <Link
            href="/business-tools/document-studio?type=invoice"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
          >
            ساخت فاکتور رایگان
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
