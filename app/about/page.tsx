import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { BRAND } from '@/lib/brand';

export const metadata = buildMetadata({
  title: 'درباره ما - جعبه ابزار فارسی',
  description:
    'درباره ماموریت، معماری local-first و استانداردهای جعبه ابزار فارسی. ابزارهای آنلاین رایگان برای کاربران فارسی‌زبان.',
  path: '/about',
  keywords: ['درباره جعبه ابزار فارسی', 'تیم PersianToolbox', 'ابزار آنلاین فارسی'],
});

export default function AboutRoute() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">درباره جعبه ابزار فارسی</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          {BRAND.siteName} یک مجموعه ابزار آنلاین فارسی با رویکرد local-first است. هدف ما ارائه
          ابزارهای سریع، شفاف و قابل اتکا برای نیازهای روزمره کاربران فارسی‌زبان است.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">اصول محصول</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">🔒 اولویت حریم خصوصی</span>
            <p className="mt-2">
              محاسبات و پردازش‌ها تا حد امکان در مرورگر کاربر انجام می‌شود. فایل‌ها و داده‌های شما
              هرگز به سرور ارسال نمی‌شوند.
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">⚡ سرعت و عملکرد</span>
            <p className="mt-2">
              وابستگی runtime به سرویس‌های خارجی به صفر نزدیک نگه داشته می‌شود. ابزارها بدون تأخیر
              شبکه اجرا می‌شوند.
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">📱 تجربه یکدست</span>
            <p className="mt-2">
              رابط کاربری ساده، سریع و قابل استفاده روی موبایل و دسکتاپ با پشتیبانی کامل RTL طراحی
              می‌شود.
            </p>
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">ابزارها و امکانات</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          {BRAND.siteName} شامل مجموعه‌ای جامع از ابزارهای کاربردی در دسته‌بندی‌های مختلف است:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            href="/tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">💰 ابزارهای مالی</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              محاسبه حقوق، وام، سود بانکی و مالیات
            </div>
          </Link>
          <Link
            href="/pdf-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">📄 ابزارهای PDF</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              ادغام، تقسیم، فشرده‌سازی و تبدیل PDF
            </div>
          </Link>
          <Link
            href="/image-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">🖼️ ابزارهای تصویر</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              فشرده‌سازی، تغییر اندازه و OCR
            </div>
          </Link>
          <Link
            href="/date-tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="text-sm font-bold text-[var(--color-primary)]">📅 ابزارهای تاریخ</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              تبدیل تاریخ شمسی، میلادی و قمری
            </div>
          </Link>
        </div>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">ارتباط با ما</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          اگر سؤال، پیشنهاد یا مشکلی دارید، از طریق کانال تلگرام یا صفحه پشتیبانی با ما در ارتباط
          باشید.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://t.me/persiantoolbox"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            کانال تلگرام
          </a>
          <Link href="/support" className="btn btn-secondary btn-sm">
            صفحه پشتیبانی
          </Link>
          <Link href="/privacy" className="btn btn-secondary btn-sm">
            سیاست حریم خصوصی
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
