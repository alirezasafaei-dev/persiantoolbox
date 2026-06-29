import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'مستندات API - جعبه ابزار فارسی',
  description:
    'مستندات کامل REST API جعبه ابزار فارسی برای توسعه‌دهندگان. دسترسی به نرخ ارز، طلا، قوانین حقوق و داده‌های تقویم.',
  path: '/developers/api',
  robots: { index: true, follow: true },
});

const baseUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://persiantoolbox.ir';

const publicEndpoints = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'بررسی سلامت سرویس',
    auth: '❌',
    rateLimit: '—',
    notes: 'بدون محدودیت. وضعیت uptime، حافظه و نسخه.',
  },
  {
    method: 'GET',
    path: '/api/ready',
    description: 'بررسی آمادگی سرویس',
    auth: '❌',
    rateLimit: '—',
    notes: 'بدون محدودیت. برای k8s/liveness probe مناسب.',
  },
  {
    method: 'GET',
    path: '/api/version',
    description: 'نسخه سرویس',
    auth: '❌',
    rateLimit: '—',
    notes: 'بدون محدودیت. شماره نسخه و تایم‌استمپ آخرین دیپلوی.',
  },
  {
    method: 'GET',
    path: '/api/public/stats',
    description: 'آمار عمومی سایت',
    auth: '❌',
    rateLimit: '—',
    notes: 'تعداد ابزارها، بازدیدها، مقالات.',
  },
  {
    method: 'GET',
    path: '/api/market',
    description: 'نرخ‌های ارز و طلا',
    auth: '❌',
    rateLimit: '۳۰ req/min',
    notes: 'نرخ لحظه‌ای دلار، یورو، سکه، طلا از چند منبع.',
  },
  {
    method: 'GET',
    path: '/api/data/salary-laws',
    description: 'قوانین حقوق و دستمزد',
    auth: '❌',
    rateLimit: '۶۰ req/min',
    notes: 'پارامترهای بیمه، مالیات، حداقل حقوق ۱۴۰۵.',
  },
  {
    method: 'GET',
    path: '/api/site-settings',
    description: 'تنظیمات عمومی سایت',
    auth: '❌',
    rateLimit: '—',
    notes: 'عنوان، توضیحات، لینک شبکه‌های اجتماعی.',
  },
  {
    method: 'GET',
    path: '/api/enamad-verification',
    description: 'نماد اعتماد (JSON)',
    auth: '❌',
    rateLimit: '—',
    notes: 'فایل JSON برای نمایش نماد اعتماد در iFrame.',
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'ورود کاربر',
    auth: '❌',
    rateLimit: '۳۰ req/min',
    notes: 'Body: { email, password }. Returns token.',
  },
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'ثبت‌نام کاربر',
    auth: '❌',
    rateLimit: '۳۰ req/min',
    notes: 'Body: { email, password }. Returns token.',
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    description: 'اطلاعات کاربر',
    auth: '✅',
    rateLimit: '—',
    notes: 'Header: Authorization: Bearer {token}',
  },
  {
    method: 'POST',
    path: '/api/analytics',
    description: 'ارسال رویداد',
    auth: '❌',
    rateLimit: '۱۲۰ req/min',
    notes: 'Body: { event, page, referrer, ... }',
  },
  {
    method: 'GET',
    path: '/api/history/share/[token]',
    description: 'دریافت ابزار اشتراکی',
    auth: '❌',
    rateLimit: '—',
    notes: 'با توکن اشتراک، داده‌های ذخیره‌شده ابزار را برمی‌گرداند.',
  },
  {
    method: 'POST',
    path: '/api/push/subscribe',
    description: 'عضویت در نوتیفیکیشن',
    auth: '❌',
    rateLimit: '—',
    notes: 'Body: { endpoint, p256dh, auth }',
  },
  {
    method: 'GET',
    path: '/api/usage/check',
    description: 'بررسی محدودیت مصرف',
    auth: '❌',
    rateLimit: '—',
    notes: 'محدودیت کاربر در ابزارهای پریمیوم.',
  },
  {
    method: 'GET',
    path: '/robots.txt',
    description: 'فایل robots.txt',
    auth: '❌',
    rateLimit: '—',
    notes: 'فایل ایستا — خزنده‌های مجاز و نقشه سایت.',
  },
  {
    method: 'GET',
    path: '/sitemap.xml',
    description: 'نقشه سایت XML',
    auth: '❌',
    rateLimit: '—',
    notes: '۲۳۵+ صفحه ایستا و پویا.',
  },
  {
    method: 'GET',
    path: '/feed.xml',
    description: 'خوراک RSS/Atom',
    auth: '❌',
    rateLimit: '—',
    notes: 'خوراک وبلاگ برای RSS reader.',
  },
];

const exampleResponse = JSON.stringify(
  {
    status: 'ok',
    version: '6.8.0',
    uptime: 12345,
    memory: { rss: 789, heapUsed: 150 },
    node: 'v20.20.2',
  },
  null,
  2,
);

export default function ApiDocsPage() {
  return (
    <SiteShell containerClassName="py-10">
      <div className="space-y-10">
        <section className="section-surface p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              API Reference
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
              مستندات API
            </h1>
            <p className="text-[var(--text-secondary)] leading-7 max-w-3xl">
              PersianToolbox APIهای عمومی و مستند. برای توسعه‌دهندگانی که می‌خواهند نرخ ارز، قوانین
              حقوق، داده‌های تقویم یا ابزارهای اعتبارسنجی را به پروژه خود اضافه کنند.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Base URL</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            <code dir="ltr" className="text-sm text-[var(--color-primary)]">
              {baseUrl}
            </code>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Authentication</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              بیشتر endpointهای عمومی نیازی به احراز هویت ندارند. برای endpointهای حساس (مانند
              اطلاعات کاربر، سابقه)، از توکن JWT در هدر Authorization استفاده کنید:
            </p>
            <pre
              dir="ltr"
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-primary)]"
            >
              Authorization: Bearer {'{'}your_jwt_token{'}'}
            </pre>
            <p className="text-xs text-[var(--text-muted)]">
              توکن را از طریق POST /api/auth/login دریافت کنید.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Rate Limiting</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              محدودیت نرخ بر اساس کلید IP اعمال می‌شود. در صورت تجاوز، کد ۴۲۹ برگردانده می‌شود:
            </p>
            <pre
              dir="ltr"
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-primary)]"
            >
              {JSON.stringify(
                { ok: false, reason: 'RATE_LIMITED', resetAt: 1719500000000 },
                null,
                2,
              )}
            </pre>
            <p className="text-xs text-[var(--text-muted)]">
              سیاست‌های محدودیت در هر endpoint در جدول زیر مشخص شده است.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Endpoints</h2>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]">
            <table className="w-full text-sm">
              <caption className="sr-only">لیست کامل API endpointها</caption>
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th
                    scope="col"
                    className="text-right py-3 px-4 font-bold text-[var(--text-primary)]"
                  >
                    Method
                  </th>
                  <th
                    scope="col"
                    className="text-right py-3 px-4 font-bold text-[var(--text-primary)]"
                  >
                    Path
                  </th>
                  <th
                    scope="col"
                    className="text-right py-3 px-4 font-bold text-[var(--text-primary)]"
                  >
                    توضیحات
                  </th>
                  <th
                    scope="col"
                    className="text-center py-3 px-4 font-bold text-[var(--text-primary)]"
                  >
                    Auth
                  </th>
                  <th
                    scope="col"
                    className="text-right py-3 px-4 font-bold text-[var(--text-primary)]"
                  >
                    Rate Limit
                  </th>
                </tr>
              </thead>
              <tbody>
                {publicEndpoints.map((ep) => (
                  <tr
                    key={ep.path + ep.method}
                    className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--surface-2)]"
                  >
                    <td className="py-3 px-4">
                      <code
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          ep.method === 'GET'
                            ? 'bg-[rgb(var(--color-success-rgb)/0.15)] text-[var(--color-success)]'
                            : 'bg-[rgb(var(--color-primary-rgb)/0.15)] text-[var(--color-primary)]'
                        }`}
                      >
                        {ep.method}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {ep.path}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] text-xs">
                      <div>{ep.description}</div>
                      {ep.notes ? (
                        <div className="text-[var(--text-secondary)] mt-1">{ep.notes}</div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {ep.auth === '✅' ? (
                        <span className="text-[var(--color-warning)]">✅</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {ep.rateLimit || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Example: Health Check</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              ساده‌ترین endpoint برای تست اتصال:
            </p>
            <pre
              dir="ltr"
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-primary)]"
            >
              {`curl ${baseUrl}/api/health`}
            </pre>
            <p className="text-sm font-bold text-[var(--text-primary)]">Response:</p>
            <pre
              dir="ltr"
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-primary)]"
            >
              {exampleResponse}
            </pre>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">Error Handling</h2>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p>همه endpointها خطاها را با ساختار یکسان برمی‌گردانند:</p>
            <pre
              dir="ltr"
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-primary)]"
            >
              {`{
  "ok": false,
  "error": "توضیح خطا",
  "reason": "ERROR_CODE"
}`}
            </pre>
            <div className="space-y-1 mt-3">
              <div className="font-bold text-[var(--text-primary)]">HTTP Status Codes:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <code className="text-xs bg-[var(--surface-2)] px-1 rounded">200</code> — موفق
                </li>
                <li>
                  <code className="text-xs bg-[var(--surface-2)] px-1 rounded">400</code> — ورودی
                  نامعتبر
                </li>
                <li>
                  <code className="text-xs bg-[var(--surface-2)] px-1 rounded">401</code> — نیاز به
                  احراز هویت
                </li>
                <li>
                  <code className="text-xs bg-[var(--surface-2)] px-1 rounded">403</code> — دسترسی
                  غیرمجاز (CSRF)
                </li>
                <li>
                  <code className="text-xs bg-[var(--surface-2)] px-1 rounded">429</code> — محدودیت
                  نرخ
                </li>
                <li>
                  <code className="text-xs bg-[var(--surface-2)] px-1 rounded">500</code> — خطای
                  سرور
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">Support</h2>
          <p className="text-sm text-[var(--text-muted)]">
            برای سوالات فنی، پیشنهادات یا گزارش باگ در API:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/alirezasafaei-dev/persiantoolbox/issues"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--text-inverted)] hover:opacity-90 transition-opacity"
            >
              GitHub Issues
            </a>
            <a
              href="mailto:alirezasafaeisystems@gmail.com?subject=API Support"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              ایمیل به تیم
            </a>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
