import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { DISCLAIMER, PRIVACY_TEXT } from '@/lib/business-documents/types';
import { DOCUMENT_TYPES } from '@/lib/business-documents/schemas';

export const metadata = buildMetadata({
  title: 'ابزارهای کسب‌وکار رایگان | فاکتور ساز، رسید ساز آنلاین',
  description:
    'فاکتور ساز آنلاین فارسی، پیش فاکتور ساز، رسید ساز، ساخت فاکتور PDF. ابزارهای حرفه‌ای برای ساخت اسناد مالی و اداری کسب‌وکار.',
  path: '/business-tools',
  keywords: [
    'فاکتور ساز آنلاین',
    'پیش فاکتور ساز',
    'رسید ساز',
    'ساخت فاکتور PDF',
    'ساخت فاکتور قابل ویرایش',
    'ابزار ساخت سند کسب‌وکار',
  ],
});

const faqItems = [
  {
    q: 'آیا این ابزار جایگزین نرم‌افزار حسابداری است؟',
    a: 'خیر. این ابزار صرفاً برای ساخت پیش‌نویس اسناد کسب‌وکار طراحی شده و جایگزین نرم‌افزار حسابداری نیست.',
  },
  {
    q: 'آیا اطلاعات من ارسال می‌شود؟',
    a: 'خیر. تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ اطلاعاتی به سرور ارسال نمی‌شود.',
  },
  {
    q: 'آیا خروجی رسمی مالیاتی است؟',
    a: 'خیر، خروجی قابل ویرایش است و مسئولیت استفاده با کاربر است.',
  },
  {
    q: 'نسخه رایگان چه محدودیتی دارد؟',
    a: 'حداکثر ۳ پیش‌نویس محلی، واترمارک روی خروجی، عدم دسترسی به خروجی Word.',
  },
  {
    q: 'نسخه پریمیوم چه امکاناتی دارد؟',
    a: 'حذف واترمارک، خروجی Word، قالب حرفه‌ای، لوگوی کسب‌وکار، پیش‌نویس نامحدود.',
  },
];

export default function BusinessToolsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="business-tools-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'ابزارهای کسب‌وکار' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای کسب‌وکار', url: `${siteUrl}/business-tools` },
        ]}
      />
      <div className="max-w-4xl mx-auto space-y-10">
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            ابزارهای کسب‌وکار
          </h1>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)] text-sm leading-7">
            ابزارهای حرفه‌ای برای ساخت اسناد مالی و اداری: فاکتور فروش، پیش‌فاکتور و رسید دریافت
            وجه. خروجی PDF و Word با طراحی حرفه‌ای و بدون نیاز به نرم‌افزار.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {DOCUMENT_TYPES.map((t) => (
            <Link
              key={t.id}
              href={`/business-tools/document-studio?type=${t.id}`}
              className="block rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.03)] transition-all"
            >
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{t.title}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-5">{t.description}</p>
            </Link>
          ))}
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
