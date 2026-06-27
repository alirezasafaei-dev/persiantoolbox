import Link from 'next/link';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'ابزار PDF فارسی | ابزارهای آنلاین PDF',
  description:
    'ابزارهای آنلاین PDF به زبان فارسی. ادغام، جدا کردن، فشرده‌سازی، تبدیل و ویرایش فایل‌های PDF.',
  path: '/pdf-tools-farsi',
  keywords: ['ابزار PDF فارسی', 'PDF آنلاین', 'ادغام PDF', 'فشرده‌سازی PDF', 'تبدیل PDF'],
});

export default function PdfToolsFarsiPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="pdf-tools-farsi-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'ابزار PDF فارسی' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزار PDF فارسی', url: `${siteUrl}/pdf-tools-farsi` },
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">ابزار PDF فارسی</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            مجموعه کامل ابزارهای آنلاین PDF به زبان فارسی. تمام پردازش‌ها در مرورگر انجام می‌شود.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/pdf-tools/merge/merge-pdf"
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2 hover:border-[var(--color-primary)] transition-all"
          >
            <h3 className="font-bold text-[var(--text-primary)]">ادغام PDF</h3>
            <p className="text-xs text-[var(--text-muted)]">ادغام چند فایل PDF در یک فایل واحد</p>
          </Link>
          <Link
            href="/pdf-tools/split/split-pdf"
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2 hover:border-[var(--color-primary)] transition-all"
          >
            <h3 className="font-bold text-[var(--text-primary)]">جدا کردن PDF</h3>
            <p className="text-xs text-[var(--text-muted)]">جدا کردن صفحات از فایل PDF</p>
          </Link>
          <Link
            href="/pdf-tools/compress/compress-pdf"
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2 hover:border-[var(--color-primary)] transition-all"
          >
            <h3 className="font-bold text-[var(--text-primary)]">فشرده‌سازی PDF</h3>
            <p className="text-xs text-[var(--text-muted)]">کاهش حجم فایل PDF</p>
          </Link>
          <Link
            href="/pdf-tools/convert/image-to-pdf"
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2 hover:border-[var(--color-primary)] transition-all"
          >
            <h3 className="font-bold text-[var(--text-primary)]">تبدیل تصویر به PDF</h3>
            <p className="text-xs text-[var(--text-muted)]">تبدیل فایل‌های تصویری به PDF</p>
          </Link>
          <Link
            href="/pdf-tools/convert/pdf-to-image"
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2 hover:border-[var(--color-primary)] transition-all"
          >
            <h3 className="font-bold text-[var(--text-primary)]">تبدیل PDF به تصویر</h3>
            <p className="text-xs text-[var(--text-muted)]">تبدیل صفحات PDF به تصویر</p>
          </Link>
          <Link
            href="/pdf-tools/extract/extract-text"
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2 hover:border-[var(--color-primary)] transition-all"
          >
            <h3 className="font-bold text-[var(--text-primary)]">استخراج متن</h3>
            <p className="text-xs text-[var(--text-muted)]">استخراج متن از فایل PDF</p>
          </Link>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">چرا ابزار PDF فارسی؟</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>رابط کاربری کاملاً فارسی</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>پردازش کاملاً محلی در مرورگر</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>بدون نیاز به ثبت‌نام</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>رایگان برای استفاده پایه</span>
            </li>
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}
