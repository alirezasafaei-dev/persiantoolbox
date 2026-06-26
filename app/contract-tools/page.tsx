import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { DISCLAIMER } from '@/lib/contract-tools/types';

export const metadata = buildMetadata({
  title: 'ابزارهای قرارداد — نمونه قرارداد آنلاین فارسی',
  description:
    'ابزار تولید پیش‌نویس قرارداد قابل ویرایش: اجاره مسکونی، پیمانکاری ساختمان. بدون جایگزینی مشاوره حقوقی.',
  path: '/contract-tools',
  keywords: [
    'نمونه قرارداد',
    'قرارداد اجاره',
    'قرارداد پیمانکاری',
    'پیش‌نویس قرارداد',
    'قرارداد فارسی',
  ],
});

const templates = [
  {
    id: 'rental-lease',
    title: 'قرارداد اجاره مسکونی',
    description: 'پیش‌نویس قرارداد اجاره با اطلاعات کامل طرفین، ملک، مبلغ و شرایط',
    icon: '🏠',
    fields: 24,
    path: '/contract-tools/rental-lease',
  },
  {
    id: 'construction-contractor',
    title: 'قرارداد پیمانکاری / معماری',
    description: 'پیش‌نویس قرارداد پیمانکاری و معماری ساختمان با بندهای تخصصی',
    icon: '🏗️',
    fields: 28,
    path: '/contract-tools/construction-contractor',
  },
];

export default function ContractToolsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="contract-tools-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'ابزارهای قرارداد' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای قرارداد', url: `${siteUrl}/contract-tools` },
        ]}
      />
      <div className="max-w-4xl mx-auto space-y-10">
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            ابزارهای قرارداد
          </h1>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)] text-sm leading-7">
            ابزار تولید پیش‌نویس قرارداد قابل ویرایش بر اساس اطلاعات واردشده توسط کاربر. این ابزار
            جایگزین مشاوره حقوقی، وکالت یا ثبت رسمی نیست.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={t.path}
              className="block rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.03)] transition-all"
            >
              <div className="text-3xl mb-3">{t.icon}</div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{t.title}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-5">{t.description}</p>
              <div className="text-[10px] text-[var(--text-muted)] mt-3">{t.fields} فیلد ورودی</div>
            </Link>
          ))}
        </div>

        <section className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-6 space-y-4">
          <h2 className="text-base font-bold text-[var(--color-info)]">سؤالات متداول</h2>
          <div className="space-y-3">
            {[
              {
                q: 'آیا این ابزار جایگزین وکیل است؟',
                a: 'خیر. این ابزار صرفاً پیش‌نویس قرارداد تولید می‌کند و جایگزین مشاوره حقوقی نیست.',
              },
              {
                q: 'آیا قرارداد تولیدشده تضمین حقوقی دارد؟',
                a: 'خیر. مسئولیت صحت اطلاعات، بررسی نهایی و آثار حقوقی بر عهده کاربران است.',
              },
              {
                q: 'آیا می‌توانم فایل را ویرایش کنم؟',
                a: 'بله. خروجی قابل ویرایش است. در نسخه حرفه‌ای، خروجی Word هم ارائه می‌شود.',
              },
              {
                q: 'آیا مسئولیت اطلاعات با من است؟',
                a: 'بله. شما مسئول صحت اطلاعات واردشده هستید.',
              },
              {
                q: 'آیا خروجی Word/PDF دارد؟',
                a: 'در نسخه رایگان خروجی متنی با واترمارک. در نسخه حرفه‌ای PDF و Word بدون واترمارک.',
              },
            ].map((item) => (
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

        <section className="text-center p-5 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]">
          <p className="text-xs text-[var(--text-muted)] leading-5 max-w-2xl mx-auto">
            {DISCLAIMER}
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
