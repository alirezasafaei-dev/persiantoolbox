import ReferShareActions from '@/components/features/refer/ReferShareActions';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'معرفی به دوستان - جعبه ابزار فارسی',
  description: 'معرفی جعبه ابزار فارسی به دوستان با لینک مستقیم صفحه اصلی.',
  path: '/refer',
});

export default function ReferPage() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <section className="section-surface p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">معرفی به دوستان</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          از این بخش می‌توانید لینک جعبه ابزار فارسی را سریع برای دوستان خود ارسال کنید تا به
          ابزارهای کاربردی، امن و فارسی‌محور دسترسی داشته باشند.
        </p>
        <ReferShareActions />
      </section>
    </SiteShell>
  );
}
