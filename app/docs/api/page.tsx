import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ButtonLink, Card } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'مستندات API - جعبه ابزار فارسی',
  description:
    'نمای کلی endpointها، قراردادهای احراز هویت و سیاست‌های امنیتی API جعبه ابزار فارسی.',
  path: '/docs/api',
});

const endpoints = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'بررسی سلامت پایه سرویس برای مانیتورینگ و load balancer.',
  },
  {
    method: 'GET',
    path: '/api/ready',
    description: 'بررسی آمادگی runtime و وابستگی‌های ضروری پیش از دریافت ترافیک.',
  },
  {
    method: 'POST',
    path: '/api/analytics',
    description: 'دریافت رویدادهای analytics فقط با قرارداد consent و سیاست امنیتی فعال.',
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'ورود کاربر در صورت فعال بودن feature احراز هویت و آماده بودن storage.',
  },
  {
    method: 'GET/PUT',
    path: '/api/admin/site-settings',
    description: 'مدیریت تنظیمات عمومی سایت برای کاربران allowlist شده ادمین.',
  },
];

const securityNotes = [
  'همه پاسخ‌های API با no-store و X-Robots-Tag noindex محافظت می‌شوند.',
  'endpointهای غیرفعال باید status 410 و payload استاندارد disabled برگردانند.',
  'routeهای مبتنی بر session cookie باید از کنترل same-origin/CSRF استفاده کنند.',
];

export default function ApiDocsPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'توسعه‌دهندگان', href: '/developers' },
          { label: 'مستندات API', current: true },
        ]}
      />

      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-bold text-[var(--text-muted)]">
            API Reference
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">
            مستندات API جعبه ابزار فارسی
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
            این صفحه نمای سریع endpointهای عمومی و عملیاتی را ارائه می‌کند. APIهای حساب، ادمین و
            درآمدزایی پشت feature flag و وابستگی‌های production مثل DATABASE_URL و allowlist ادمین
            قرار دارند.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/developers" size="sm" variant="secondary">
              بازگشت به مرکز توسعه‌دهندگان
            </ButtonLink>
            <ButtonLink href="/api/health" size="sm">
              بررسی health
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {endpoints.map((endpoint) => (
          <Card key={`${endpoint.method}-${endpoint.path}`} className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2" dir="ltr">
                  <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-black text-white">
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-bold text-[var(--text-primary)]">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-sm leading-7 text-[var(--text-muted)]">{endpoint.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-black text-[var(--text-primary)]">قراردادهای امنیتی</h2>
        <ul className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
          {securityNotes.map((note) => (
            <li key={note} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
