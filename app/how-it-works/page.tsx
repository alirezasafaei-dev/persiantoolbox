import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'نحوه کار ابزارها - جعبه ابزار فارسی',
  description: 'توضیح نحوه کار ابزارها، پردازش محلی و شیوه استفاده از خروجی‌ها',
  path: '/how-it-works',
});

export default function HowItWorksRoute() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">نحوه کار ابزارها</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          در جعبه ابزار فارسی ابتدا ورودی را در مرورگر وارد می‌کنید، سپس محاسبه یا پردازش محلی انجام
          می‌شود و خروجی همان لحظه در اختیار شما قرار می‌گیرد.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">فرآیند سه مرحله‌ای</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">۱. ورودی دقیق</span>
            <p className="mt-2">ورودی را با واحد و فرمت درست وارد کنید.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">۲. پردازش فوری</span>
            <p className="mt-2">ابزار نتیجه را به‌صورت محلی و سریع محاسبه می‌کند.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7">
            <span className="font-semibold text-[var(--text-primary)]">۳. دریافت خروجی</span>
            <p className="mt-2">خروجی را بررسی، کپی یا در مرورگر ذخیره کنید.</p>
          </li>
        </ol>
      </section>
    </SiteShell>
  );
}
