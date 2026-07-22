import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import ButtonLink from '@/shared/ui/ButtonLink';
import ToolShowcase from '@/components/home/ToolShowcase';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'صفحه یافت نشد - جعبه ابزار فارسی',
  description: 'صفحه مورد نظر شما یافت نشد. از صفحه اصلی یا همه ابزارها دیدن کنید.',
  path: '/404',
  robots: { index: false, follow: false },
});

export default function NotFound() {
  return (
    <SiteShell containerClassName="py-16 space-y-12">
      <section className="section-surface p-10 text-center">
        <div className="text-6xl font-black text-[var(--text-primary)]">۴۰۴</div>
        <h1 className="mt-4 text-2xl font-black text-[var(--text-primary)]">
          صفحه‌ای که دنبالش بودید پیدا نشد
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          شاید لینک اشتباه باشد یا صفحه جابه‌جا شده باشد. از صفحه اصلی یا همه ابزارها ادامه دهید.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/tools" variant="primary" size="md">
            رفتن به همه ابزارها
          </ButtonLink>
          <Link href="/" className="text-sm font-semibold text-[var(--color-primary)]">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </section>

      <ToolShowcase mode="popular" />
    </SiteShell>
  );
}
