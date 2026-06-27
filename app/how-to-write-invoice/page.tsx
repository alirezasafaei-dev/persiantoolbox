import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'راهنمای نوشتن فاکتور | نحوه صدور فاکتور رسمی',
  description: 'راهنمای کامل نوشتن فاکتور فروش، پیش‌فاکتور و رسید. قوانین فاکتور رسمی و نکات مهم.',
  path: '/how-to-write-invoice',
  keywords: ['نوشتن فاکتور', 'فاکتور رسمی', 'صغور فاکتور', 'قانون فاکتور'],
});

export default function HowToWriteInvoicePage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="how-to-write-invoice-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'راهنمای نوشتن فاکتور' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'راهنمای نوشتن فاکتور', url: `${siteUrl}/how-to-write-invoice` },
        ]}
      />
      <Script
        id="how-to-write-invoice-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'فاکتور رسمی چه اطلاعاتی دارد؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'شماره فاکتور، تاریخ، اطلاعات فروشنده و خریدار، شرح کالاها، مبالغ، مالیات و جمع کل.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا فاکتور آنلاین رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خروجی‌ها برای استفاده عمومی و اداری مناسب هستند. برای موارد رسمی با مشاور حسابداری مشورت کنید.',
                },
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">راهنمای نوشتن فاکتور</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            راهنمای کامل نوشتن فاکتور فروش، پیش‌فاکتور و رسید. قوانین فاکتور رسمی و نکات مهم.
          </p>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">اطلاعات ضروری فاکتور</h2>
          <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal list-inside">
            <li>شماره فاکتور (ترتیبی)</li>
            <li>تاریخ صدور</li>
            <li>اطلاعات کامل فروشنده (نام، آدرس، شناسه ملی، کد اقتصادی)</li>
            <li>اطلاعات کامل خریدار</li>
            <li>شرح کالاها یا خدمات</li>
            <li>تعداد و واحد</li>
            <li>مبلغ واحد و جمع کل</li>
            <li>تخفیف (در صورت وجود)</li>
            <li>مالیات ارزش افزوده</li>
            <li>جمع کل نهایی</li>
          </ol>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">نکات مهم</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-warning)]">⚠️</span>
              <span>شماره فاکتور باید ترتیبی و بدون تکرار باشد.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-warning)]">⚠️</span>
              <span>اطلاعات فروشنده و خریدار باید کامل و صحیح باشد.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-warning)]">⚠️</span>
              <span>مالیات ارزش افزوده طبق قانون محاسبه می‌شود.</span>
            </li>
          </ul>
        </section>

        <section className="text-center">
          <Link
            href="/business-tools/document-studio?type=invoice"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
          >
            ساخت فاکتور با ابزار آنلاین
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
