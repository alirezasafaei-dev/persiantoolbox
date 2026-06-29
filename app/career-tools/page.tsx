import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { DISCLAIMER, PRIVACY_TEXT } from '@/lib/career-documents/types';
import { DOCUMENT_TYPES } from '@/lib/career-documents/schemas';

export const metadata = buildMetadata({
  title: 'ابزارهای شغلی رایگان | رزومه ساز و کاورلتر ساز آنلاین',
  description:
    'رزومه ساز آنلاین، ساخت رزومه فارسی، ساخت رزومه انگلیسی، کاورلتر ساز حرفه‌ای. ابزارهای شغلی برای ساخت اسناد حرفه‌ای با خروجی PDF و Word.',
  path: '/career-tools',
  keywords: [
    'رزومه ساز آنلاین',
    'ساخت رزومه فارسی',
    'ساخت رزومه انگلیسی',
    'رزومه ساز PDF',
    'رزومه قابل ویرایش Word',
    'کاورلتر ساز',
  ],
});

const faqItems = [
  {
    q: 'آیا این ابزار استخدام را تضمین می‌کند؟',
    a: 'خیر.',
  },
  {
    q: 'آیا اطلاعات من ارسال می‌شود؟',
    a: 'خیر. تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ اطلاعاتی به سرور ارسال نمی‌شود.',
  },
  {
    q: 'آیا خروجی Word دارد؟',
    a: 'در پلن حرفه‌ای.',
  },
  {
    q: 'آیا رزومه انگلیسی هم می‌سازد؟',
    a: 'بله.',
  },
  {
    q: 'نسخه رایگان چه محدودیتی دارد؟',
    a: 'حداکثر ۲ پیش‌نویس محلی، واترمارک روی خروجی، عدم دسترسی به خروجی Word.',
  },
  {
    q: 'نسخه حرفه‌ای چه امکاناتی دارد؟',
    a: 'حذف واترمارک، خروجی Word، قالب حرفه‌ای، لوگوی شخصی، پیش‌نویس نامحدود.',
  },
];

export default function CareerToolsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="career-tools-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'ابزارهای شغلی' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای شغلی', url: `${siteUrl}/career-tools` },
        ]}
      />
      <div className="max-w-4xl mx-auto space-y-10">
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            ابزارهای شغلی
          </h1>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)] text-sm leading-7">
            ابزارهای حرفه‌ای برای ساخت رزومه و اسناد شغلی: رزومه فارسی، رزومه انگلیسی و کاورلتر.
            خروجی PDF و Word با طراحی حرفه‌ای و بدون نیاز به نرم‌افزار.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {DOCUMENT_TYPES.map((t) => (
            <Link
              key={t.id}
              href={`/career-tools/resume-builder?type=${t.id}`}
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
