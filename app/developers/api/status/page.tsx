import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { developerApiProducts } from '@/lib/developer-api-catalog';

const product = developerApiProducts.find((item) => item.id === 'status');

if (!product) {
  throw new Error('Status API catalog entry is missing');
}

export const metadata = buildMetadata({
  title: 'Health Check و Status API | مستندات PersianToolbox',
  description:
    'مستندات endpointهای health، ready و version برای مانیتورینگ، liveness و readiness سرویس PersianToolbox.',
  path: product.docsPath,
  keywords: product.keywords,
});

const endpoints = [
  {
    path: '/api/health',
    purpose: 'بررسی پاسخ‌گویی سرویس و اطلاعات عملیاتی عمومی.',
    usage: 'liveness probe و مانیتورینگ uptime',
  },
  {
    path: '/api/ready',
    purpose: 'بررسی آماده‌بودن سرویس برای دریافت ترافیک.',
    usage: 'readiness probe پیش از هدایت ترافیک',
  },
  {
    path: '/api/version',
    purpose: 'دریافت نسخه و اطلاعات build یا deploy جاری.',
    usage: 'ثبت نسخه در گزارش خطا و کنترل انتشار',
  },
];

export default function StatusApiDocsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <article className="space-y-10">
        <header className="section-surface space-y-4 p-6 md:p-8">
          <div className="text-xs font-semibold text-[var(--color-primary)]">Operations API</div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">{product.title}</h1>
          <p className="max-w-3xl leading-8 text-[var(--text-secondary)]">{product.description}</p>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.path}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6"
            >
              <div className="mb-3 text-xs font-bold text-[var(--color-primary)]">GET</div>
              <h2 dir="ltr" className="mb-3 font-mono text-lg font-black text-[var(--text-primary)]">
                {endpoint.path}
              </h2>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">{endpoint.purpose}</p>
              <p className="mt-3 text-xs leading-6 text-[var(--text-muted)]">کاربرد: {endpoint.usage}</p>
              <a
                href={endpoint.path}
                className="mt-4 inline-flex text-sm font-bold text-[var(--color-primary)] hover:underline"
              >
                مشاهده پاسخ زنده
              </a>
            </div>
          ))}
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
          <h2 className="mb-4 text-xl font-black text-[var(--text-primary)]">نمونه تنظیم مانیتورینگ</h2>
          <pre
            dir="ltr"
            className="overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 text-xs leading-6 text-[var(--text-secondary)]"
          >
            {`curl --fail --silent --show-error \\\n  https://persiantoolbox.ir/api/ready`}
          </pre>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            endpointهای عملیاتی برای پایش سرویس‌اند و نباید به‌عنوان API داده کسب‌وکار یا منبع ترافیک
            کاربر نهایی استفاده شوند.
          </p>
        </section>

        <a
          href="/openapi.json"
          className="inline-flex rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-[var(--text-inverted)]"
        >
          دریافت سند OpenAPI
        </a>
      </article>
    </SiteShell>
  );
}
