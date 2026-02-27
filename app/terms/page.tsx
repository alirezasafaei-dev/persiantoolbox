import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'قوانین استفاده - جعبه ابزار فارسی',
  description: 'قوانین و شرایط استفاده از جعبه ابزار فارسی.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">قوانین استفاده</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          این صفحه چارچوب استفاده از جعبه ابزار فارسی را مشخص می‌کند. استفاده از سایت به معنی پذیرش
          این قوانین است.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">اصول عمومی استفاده</h2>
        <ul className="grid gap-3 text-sm leading-7 text-[var(--text-secondary)]">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            با استفاده از ابزارهای این سایت، مسئولیت صحت نهایی ورودی‌ها و خروجی‌ها بر عهده کاربر
            است.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            خروجی‌ها برای تصمیم‌سازی سریع ارائه می‌شوند و جایگزین اسناد حقوقی یا مالی رسمی نیستند.
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            استفاده از سایت برای اهداف غیرقانونی، سوءاستفاده فنی، یا تلاش برای اختلال در سرویس مجاز
            نیست.
          </li>
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-black text-[var(--text-primary)]">انطباق قانونی</h2>
        <p className="text-sm leading-7 text-[var(--text-secondary)]">
          این سایت از قوانین جمهوری اسلامی ایران پیروی میکند.
        </p>
      </section>
    </SiteShell>
  );
}
