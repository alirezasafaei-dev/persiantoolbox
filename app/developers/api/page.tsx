import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { developerApiProducts } from '@/lib/developer-api-catalog';

export const metadata = buildMetadata({
  title: 'API رایگان فارسی برای توسعه‌دهندگان | PersianToolbox',
  description:
    'مرکز مستندات API عمومی PersianToolbox برای نرخ‌های مرجع بازار، قوانین حقوق ۱۴۰۵ و وضعیت سرویس؛ همراه OpenAPI و نمونه کد.',
  path: '/developers/api',
  keywords: [
    'api رایگان فارسی',
    'api ایرانی برای برنامه نویسان',
    'api نرخ ارز',
    'api حقوق ۱۴۰۵',
    'openapi فارسی',
  ],
});

const baseUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://persiantoolbox.ir';

export default function ApiDocsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <div className="space-y-12">
        <header className="section-surface space-y-5 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            Public API v8
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">
            APIهای عمومی PersianToolbox
          </h1>
          <p className="max-w-3xl leading-8 text-[var(--text-secondary)]">
            endpointهای عمومی و بدون کلید برای داده‌های نسخه‌دار فارسی و مانیتورینگ سرویس. هر محصول
            صفحه مستقل، قرارداد پاسخ، سیاست cache و نمونه کد دارد.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/openapi.json"
              className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--text-inverted)]"
            >
              دریافت OpenAPI 3.1
            </a>
            <Link
              href="/developers"
              className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
            >
              مرکز توسعه‌دهندگان
            </Link>
            <a
              href="https://github.com/alirezasafaei-dev/persiantoolbox/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--border-light)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]"
            >
              گزارش مشکل API
            </a>
          </div>
        </header>

        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">محصولات عمومی API</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
              فقط endpointهای مناسب مصرف عمومی و دارای قرارداد مستند در این فهرست نمایش داده می‌شوند.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {developerApiProducts.map((product) => (
              <article
                key={product.id}
                className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] px-3 py-1 text-xs font-black text-[var(--color-success)]">
                    {product.method}
                  </span>
                  <code dir="ltr" className="text-xs text-[var(--text-muted)]">
                    {product.endpoint}
                  </code>
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">{product.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--text-secondary)]">
                  {product.description}
                </p>
                <div className="mt-5 space-y-2 text-xs leading-6 text-[var(--text-muted)]">
                  <p>{product.rateLimit}</p>
                  <p>{product.cachePolicy}</p>
                </div>
                <Link
                  href={product.docsPath}
                  className="mt-5 inline-flex font-bold text-[var(--color-primary)] hover:underline"
                >
                  مشاهده مستندات و نمونه کد
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <h2 className="mb-4 text-xl font-black text-[var(--text-primary)]">Base URL</h2>
            <pre
              dir="ltr"
              className="overflow-x-auto rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 text-sm text-[var(--color-primary)]"
            >
              {baseUrl}
            </pre>
            <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
              endpointهای داده معرفی‌شده در این صفحه در حال حاضر بدون API key قابل استفاده‌اند. برای
              جلوگیری از اختلال، محدودیت مصرف، ETag و cache headers هر endpoint را رعایت کنید.
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <h2 className="mb-4 text-xl font-black text-[var(--text-primary)]">شروع سریع</h2>
            <pre
              dir="ltr"
              className="overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 text-xs leading-6 text-[var(--text-secondary)]"
            >
              {`const response = await fetch(
  'https://persiantoolbox.ir/api/data/salary-laws'
);

if (!response.ok) throw new Error('API request failed');
const data = await response.json();`}
            </pre>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[rgb(var(--color-warning-rgb)/0.08)] p-6">
          <h2 className="mb-3 text-xl font-black text-[var(--text-primary)]">قواعد مصرف مسئولانه</h2>
          <ul className="list-disc space-y-2 ps-6 text-sm leading-7 text-[var(--text-secondary)]">
            <li>مقدار freshness، sources، version و updatedAt را پیش از استفاده بررسی کنید.</li>
            <li>API بازار، نرخ معامله یا بازار آزاد ایران را تضمین نمی‌کند.</li>
            <li>dataset حقوق جایگزین متن رسمی قانون یا مشاوره حسابداری و حقوقی نیست.</li>
            <li>برای polling از cache headers، ETag و فاصله زمانی منطقی استفاده کنید.</li>
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}
