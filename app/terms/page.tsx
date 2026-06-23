import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'قوانین استفاده - جعبه ابزار فارسی',
  description:
    'قوانین و شرایط استفاده از جعبه ابزار فارسی. حقوق کاربران، محدودیت‌ها و شرایط خدمات.',
  path: '/terms',
  keywords: ['قوانین', 'شرایط استفاده', 'قوانین سایت'],
});

export default function TermsPage() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">قوانین و شرایط استفاده</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          این صفحه چارچوب استفاده از جعبه ابزار فارسی را مشخص می‌کند. استفاده از سایت به معنی پذیرش
          این قوانین است.
        </p>
        <p className="text-xs text-[var(--text-muted)]">آخرین به‌روزرسانی: ۲۳ خرداد ۱۴۰۵</p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">۱. شرایط عمومی</h2>
        <ul className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            استفاده از ابزارهای این سایت رایگان است و نیازی به ثبت‌نام ندارد.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            مسئولیت صحت ورودی‌ها و خروجی‌ها بر عهده کاربر است. خروجی‌ها برای تصمیم‌گیری اولیه هستند.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            استفاده از سایت برای اهداف غیرقانونی، سوءاستفاده فنی، یا تلاش برای اختلال مجاز نیست.
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">۲. حریم خصوصی</h2>
        <ul className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            تمام پردازش‌ها در مرورگر کاربر انجام می‌شود و فایل‌ها به سرور ارسال نمی‌شوند.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            در صورت ثبت‌نام اختیاری، فقط ایمیل و رمز عبور هش‌شده ذخیره می‌شود.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            اطلاعات شخصی کاربران به اشخاص ثالث فروخته یا واگذار نمی‌شود.
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">۳. محدودیت مسئولیت</h2>
        <ul className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            خروجی ابزارهای مالی جایگزین مشاوره مالی حرفه‌ای نیست.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            قوانین مالیاتی و حقوقی ممکن است تغییر کنند. همیشه با قوانین رسمی تطبیق دهید.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            سایت تضمینی برای دقت ۱۰۰٪ خروجی‌ها ارائه نمی‌دهد.
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">۴. حقوق مالکیت</h2>
        <ul className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            محتوای آموزشی و طراحی سایت متعلق به جعبه ابزار فارسی است.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            کپی‌برداری غیرمجاز از محتوا یا ابزارها ممنوع است.
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">۵. تغییرات</h2>
        <p className="text-sm leading-7 text-[var(--text-secondary)]">
          این قوانین ممکن است بدون اطلاع قبلی تغییر کنند. استفاده مداوم از سایت به معنی پذیرش آخرین
          نسخه قوانین است.
        </p>
      </section>
    </SiteShell>
  );
}
