import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'درباره ما - جعبه ابزار فارسی',
  description: 'درباره ماموریت، معماری local-first و استانداردهای جعبه ابزار فارسی',
  path: '/about',
});

export default function AboutRoute() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">درباره ما</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          جعبه ابزار فارسی یک مجموعه ابزار آنلاین فارسی با رویکرد local-first است. هدف ما ارائه
          ابزارهای سریع، شفاف و قابل اتکا برای نیازهای روزمره کاربران فارسی‌زبان است.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">اصول محصول</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">اولویت حریم خصوصی</span>
            <p className="mt-2">محاسبات و پردازش‌ها تا حد امکان در مرورگر کاربر انجام می‌شود.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">پایداری فنی</span>
            <p className="mt-2">
              وابستگی runtime به سرویس‌های خارجی به صفر نزدیک نگه داشته می‌شود.
            </p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">تجربه یکدست</span>
            <p className="mt-2">
              رابط کاربری ساده، سریع و قابل استفاده روی موبایل و دسکتاپ طراحی می‌شود.
            </p>
          </li>
        </ul>
      </section>
    </SiteShell>
  );
}
