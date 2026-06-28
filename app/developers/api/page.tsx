import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'API و Widget - جعبه ابزار فارسی',
  description: 'دسترسی API و Widget به ابزارهای جعبه ابزار فارسی برای توسعه‌دهندگان و کسب‌وکارها.',
  path: '/developers/api',
  robots: { index: true, follow: true },
});

const useCases = [
  {
    title: 'وب‌سایت‌های مالی',
    description: 'اضافه کردن ماشین‌حساب وام، حقوق و مالیات به وب‌سایت خود',
    icon: '💰',
  },
  {
    title: 'پلتفرم‌های HR',
    description: 'محاسبه خودکار حقوق خالص، بیمه و مالیات کارکنان',
    icon: '👥',
  },
  {
    title: 'ابزارهای اداری',
    description: 'تبدیل تاریخ، تولید QR Code و پردازش PDF در برنامه‌های اداری',
    icon: '📋',
  },
  {
    title: 'اپلیکیشن‌های موبایل',
    description: 'ادغام ابزارهای فارسی در اپلیکیشن‌های موبایل',
    icon: '📱',
  },
];

const features = [
  {
    title: 'پردازش محلی',
    description: 'تمام محاسبات در سمت کلاینت انجام می‌شود. سرور شما بار پردازشی ندارد.',
  },
  {
    title: 'بدون محدودیت درخواست',
    description: 'از آنجا که پردازش محلی است، محدودیتی برای تعداد درخواست‌ها وجود ندارد.',
  },
  {
    title: 'رایگان',
    description: 'استفاده از API و Widget در حال حاضر رایگان است.',
  },
  {
    title: 'مستندات کامل',
    description: 'مستندات فارسی و انگلیسی با مثال‌های عملی.',
  },
];

export default function ApiDiscoveryPage() {
  return (
    <SiteShell containerClassName="py-10">
      <div className="space-y-10">
        <section className="section-surface p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              API و Widget
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
              ابزارهای فارسی برای پروژه شما
            </h1>
            <p className="text-[var(--text-secondary)] leading-7 max-w-3xl">
              به وب‌سایت یا اپلیکیشن خود ابزارهای فارسی اضافه کنید. تمام پردازش‌ها در مرورگر کاربر
              انجام می‌شود و نیازی به سرور اختصاصی نیست.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">موارد استفاده</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3"
              >
                <div className="text-2xl">{useCase.icon}</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{useCase.title}</div>
                <div className="text-sm text-[var(--text-muted)] leading-6">
                  {useCase.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ویژگی‌ها</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2"
              >
                <div className="text-lg font-bold text-[var(--text-primary)]">{feature.title}</div>
                <div className="text-sm text-[var(--text-muted)] leading-6">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ابزارهای موجود</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">لیست ابزارهای موجود در API</caption>
                <thead>
                  <tr className="border-b border-[var(--border-light)]">
                    <th
                      scope="col"
                      className="text-start pb-3 font-bold text-[var(--text-primary)]"
                    >
                      دسته‌بندی
                    </th>
                    <th
                      scope="col"
                      className="text-start pb-3 font-bold text-[var(--text-primary)]"
                    >
                      ابزار
                    </th>
                    <th
                      scope="col"
                      className="text-start pb-3 font-bold text-[var(--text-primary)]"
                    >
                      نوع
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border-light)]">
                    <td className="py-3 font-semibold text-[var(--text-primary)]">مالی</td>
                    <td className="py-3 text-[var(--text-muted)]">محاسبه وام، حقوق، مالیات، سود</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[rgb(var(--color-success-rgb)/0.15)] px-2 py-0.5 text-xs font-bold text-[var(--color-success)]">
                        JSON
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--border-light)]">
                    <td className="py-3 font-semibold text-[var(--text-primary)]">تاریخ</td>
                    <td className="py-3 text-[var(--text-muted)]">
                      تبدیل شمسی/میلادی، اختلاف تاریخ
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[rgb(var(--color-success-rgb)/0.15)] px-2 py-0.5 text-xs font-bold text-[var(--color-success)]">
                        JSON
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--border-light)]">
                    <td className="py-3 font-semibold text-[var(--text-primary)]">متن</td>
                    <td className="py-3 text-[var(--text-muted)]">
                      شمارش کلمات، تبدیل حروف، اعتبارسنجی
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[rgb(var(--color-success-rgb)/0.15)] px-2 py-0.5 text-xs font-bold text-[var(--color-success)]">
                        JSON
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--border-light)]">
                    <td className="py-3 font-semibold text-[var(--text-primary)]">PDF</td>
                    <td className="py-3 text-[var(--text-muted)]">
                      ادغام، تقسیم، فشرده‌سازی، حذف رمز
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[rgb(var(--color-info-rgb)/0.15)] px-2 py-0.5 text-xs font-bold text-[var(--color-info)]">
                        File
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-[var(--text-primary)]">تصویر</td>
                    <td className="py-3 text-[var(--text-muted)]">
                      تغییر اندازه، چرخش، حذف پس‌زمینه
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[rgb(var(--color-info-rgb)/0.15)] px-2 py-0.5 text-xs font-bold text-[var(--color-info)]">
                        File
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">نحوه شروع</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--text-inverted)]">
                  ۱
                </span>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    پکیج npm را نصب کنید
                  </div>
                  <code className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-1 rounded mt-1 inline-block">
                    npm install @persiantoolbox/core
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--text-inverted)]">
                  ۲
                </span>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    ابزار مورد نظر را انتخاب کنید
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    از بین ۴۶+ ابزار موجود، ابزار مناسب پروژه خود را پیدا کنید.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--text-inverted)]">
                  ۳
                </span>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    در پروژه خود ادغام کنید
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    با چند خط کد، ابزار را در وب‌سایت یا اپلیکیشن خود ادغام کنید.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">تماس با ما</h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            برای کسب اطلاعات بیشتر در مورد API، Widget یا همکاری تجاری، با ما تماس بگیرید.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:alirezasafaeisystems@gmail.com?subject=API/Widget Inquiry"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--text-inverted)] hover:opacity-90 transition-opacity"
            >
              ایمیل به تیم پشتیبانی
            </a>
            <Link
              href="/developers"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              راهنمای توسعه‌دهندگان
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
