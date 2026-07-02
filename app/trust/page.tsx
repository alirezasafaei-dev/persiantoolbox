import Link from 'next/link';
import Script from 'next/script';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'شفافیت فنی - جعبه ابزار فارسی',
  description:
    'نگاه فنی به نحوه عملکرد جعبه ابزار فارسی: پردازش محلی، رفتار شبکه، تحلیل‌گر و حریم خصوصی.',
  path: '/trust',
  robots: { index: true, follow: true },
});

const dataClasses = [
  {
    category: 'فایل‌های کاربر',
    items: ['فایل‌های PDF', 'تصاویر', 'متن ورودی'],
    location: 'مرورگر شما',
    sentToServer: false,
    description: 'تمام پردازش‌ها در مرورگر انجام می‌شود. فایل‌ها به هیچ سروری ارسال نمی‌شوند.',
  },
  {
    category: 'داده‌های محاسباتی',
    items: [' مقادیر وام', 'نرخ سود', 'تاریخ تبدیل‌شده'],
    location: 'مرورگر شما',
    sentToServer: false,
    description: 'نتایج محاسبات فقط در حافظه مرورگر ذخیره می‌شوند و قابل بازیابی نیستند.',
  },
  {
    category: 'تاریخچه استفاده',
    items: ['تعداد استفاده از هر ابزار', 'آخرین ابزار استفاده‌شده'],
    location: 'localStorage مرورگر',
    sentToServer: false,
    description: 'سابقه استفاده فقط روی دستگاه شما ذخیره می‌شود و با پاک کردن مرورگر حذف می‌شود.',
  },
  {
    category: 'رویدادهای تحلیلی',
    items: ['بازدید صفحه', 'تغییر رضایت تبلیغات'],
    location: 'سرور خودمیزبان',
    sentToServer: true,
    conditional: true,
    description: 'فقط با رضایت صریح شما ارسال می‌شود. بدون محتوای فایل یا اطلاعات شخصی.',
  },
  {
    category: 'خطاها',
    items: ['پیام خطا', 'Stack trace', 'آدرس صفحه'],
    location: 'سرور خودمیزبان',
    sentToServer: true,
    description: 'فقط در حالت production ارسال می‌شود. بدون اطلاعات شخصی یا محتوای فایل.',
  },
];

const networkBehaviors = [
  {
    type: 'خودمیزبان',
    requests: ['API تحلیل‌گر (/api/analytics)', 'API خطاها (/api/errors)'],
    blocked: false,
    description: 'ارتباط فقط با سرور خود سایت انجام می‌شود.',
  },
  {
    type: 'مسدود شده توسط CSP',
    requests: ['درخواست‌های شخص ثالث', 'تبلیغات خارجی', 'ردیاب‌های خارجی'],
    blocked: true,
    description: 'سیاست امنیتی محتوا (CSP) تمام درخواست‌های خارجی را مسدود می‌کند.',
  },
];

const sensitiveTools = [
  {
    name: 'ادغام PDF',
    path: '/pdf-tools/merge/merge-pdf',
    risk: 'فایل‌ها در مرورگر ادغام می‌شوند',
  },
  {
    name: 'فشرده‌سازی PDF',
    path: '/pdf-tools/compress/compress-pdf',
    risk: 'فایل در مرورگر فشرده می‌شود',
  },
  {
    name: 'حذف رمز PDF',
    path: '/pdf-tools/security/decrypt-pdf',
    risk: 'رمز در مرورگر حذف می‌شود',
  },
  {
    name: 'تبدیل PDF به تصویر',
    path: '/pdf-tools/convert/pdf-to-image',
    risk: 'تبدیل در مرورگر انجام می‌شود',
  },
  {
    name: 'حذف پس‌زمینه تصویر',
    path: '/image-tools/image-background-remover',
    risk: 'پردازش در مرورگر انجام می‌شود',
  },
  { name: 'محاسبه وام', path: '/loan', risk: 'محاسبات کاملاً محلی هستند' },
  { name: 'محاسبه حقوق', path: '/salary', risk: 'محاسبات کاملاً محلی هستند' },
];

export default function TrustPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="trust-faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا اطلاعات من ذخیره می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام محاسبات در مرورگر شما انجام می‌شود. هیچ اطلاعاتی از فایل‌ها یا داده‌های شما در سرور ذخیره نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا سایت امن است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، از HTTPS، سیاست امنیتی محتوا (CSP) و محافظت CSRF استفاده می‌کنیم. درخواست‌های خارجی فقط برای سرویس‌های ضروری مجاز هستند.',
                },
              },
              {
                '@type': 'Question',
                name: 'چه اطلاعاتی جمع‌آوری می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'فقط اطلاعات ضروری مانند آدرس IP برای محدودیت درخواست جمع‌آوری می‌شود. بدون ردیابی شخص ثالث یا کوکی‌های تبلیغاتی.',
                },
              },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'امنیت و حریم خصوصی', url: `${siteUrl}/trust` },
        ]}
      />
      <div className="space-y-10">
        <section className="section-surface p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
              شفافیت فنی
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
              نگاه فنی به عملکرد سایت
            </h1>
            <p className="text-[var(--text-secondary)] leading-7 max-w-3xl">
              این صفحه توضیح می‌دهد سایت چگونه کار می‌کند، چه داده‌هایی پردازش می‌شوند، و چه
              ارتباطات شبکه‌ای برقرار می‌شود. هدف شفافیت کامل فنی است.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">طبقه‌بندی داده‌ها</h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            هر نوع داده‌ای که در سایت پردازش می‌شود در جدول زیر طبقه‌بندی شده است.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">طبقه‌بندی داده‌ها و محل ذخیره‌سازی</caption>
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th scope="col" className="text-start pb-3 font-bold text-[var(--text-primary)]">
                    نوع داده
                  </th>
                  <th scope="col" className="text-start pb-3 font-bold text-[var(--text-primary)]">
                    نمونه
                  </th>
                  <th scope="col" className="text-start pb-3 font-bold text-[var(--text-primary)]">
                    محل ذخیره
                  </th>
                  <th scope="col" className="text-start pb-3 font-bold text-[var(--text-primary)]">
                    ارسال به سرور
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataClasses.map((row) => (
                  <tr key={row.category} className="border-b border-[var(--border-light)]">
                    <td className="py-3 font-semibold text-[var(--text-primary)]">
                      {row.category}
                    </td>
                    <td className="py-3 text-[var(--text-muted)]">{row.items.join('، ')}</td>
                    <td className="py-3 text-[var(--text-muted)]">{row.location}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.sentToServer
                            ? row.conditional
                              ? 'bg-[rgb(var(--color-warning-rgb)/0.15)] text-[var(--color-warning)]'
                              : 'bg-[rgb(var(--color-info-rgb)/0.15)] text-[var(--color-info)]'
                            : 'bg-[rgb(var(--color-success-rgb)/0.15)] text-[var(--color-success)]'
                        }`}
                      >
                        {row.sentToServer ? (row.conditional ? 'با رضایت' : 'فقط خطاها') : 'خیر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">رفتار شبکه</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {networkBehaviors.map((behavior) => (
              <div
                key={behavior.type}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      behavior.blocked ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-success)]'
                    }`}
                  />
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {behavior.type}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-6">{behavior.description}</p>
                <ul className="space-y-1">
                  {behavior.requests.map((req) => (
                    <li
                      key={req}
                      className="text-xs text-[var(--text-muted)] flex items-center gap-2"
                    >
                      <span aria-hidden="true" className="text-[var(--text-muted)]">
                        •
                      </span>
                      <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5">{req}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">تحلیل‌گر و رضایت</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3">
            <p className="text-sm text-[var(--text-secondary)] leading-7">
              تحلیل‌گر سایت <strong>کاملاً مبتنی بر رضایت</strong> است. پیش‌فرض تمام ردیاب‌ها
              غیرفعال است و فقط با رضایت صریح شما فعال می‌شوند.
            </p>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 text-[var(--color-success)]">
                  ✓
                </span>
                <span>پیش‌فرض: ردیابی غیرفعال</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 text-[var(--color-success)]">
                  ✓
                </span>
                <span>بدون کوکی‌های ردیابی شخص ثالث</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 text-[var(--color-success)]">
                  ✓
                </span>
                <span>بدون ارسال محتوای فایل یا اطلاعات شخصی</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1 text-[var(--color-success)]">
                  ✓
                </span>
                <span>
                  قابل لغو در هر زمان از صفحه{' '}
                  <Link href="/ads" className="text-[var(--color-primary)] hover:underline">
                    شفافیت تبلیغات
                  </Link>
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ابزارهای حساس</h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            ابزارهای زیر با فایل‌های شخصی کار می‌کنند. تمام آن‌ها پردازش محلی دارند.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {sensitiveTools.map((tool) => (
              <Link
                key={tool.path}
                href={tool.path}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="text-sm font-bold text-[var(--text-primary)]">{tool.name}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{tool.risk}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-3">
          <h2 className="text-lg font-black text-[var(--text-primary)]">
            سیاست امنیتی محتوا (CSP)
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            سایت از سیاست امنیتی محتوای محدود استفاده می‌کند. درخواست‌های خارجی فقط برای سرویس‌های
            ضروری مثل نماد اعتماد و گزارش خطای فنی مجاز هستند. ابزارهای فایل، تصویر و متن همچنان
            داده‌های شما را برای پردازش به سرور ارسال نمی‌کنند.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              سیاست حریم خصوصی
            </Link>
            <Link
              href="/guides/privacy-local-first-guide"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              راهنمای حریم خصوصی محلی‌اول
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
