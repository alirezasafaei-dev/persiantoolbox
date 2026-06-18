import Link from 'next/link';
import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, getFeatureInfo } from '@/lib/features/availability';

export const metadata = featurePageMetadata('checkout', {
  title: 'پرداخت - جعبه ابزار فارسی',
  description: 'صفحه پرداخت و تأیید اشتراک جعبه ابزار فارسی',
});

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const feature = getFeatureInfo('checkout');
  if (!feature.enabled) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="checkout" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg space-y-8 py-12">
        <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-8 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--color-warning-rgb)/0.15)]">
            <svg className="h-8 w-8 text-[var(--color-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            در انتظار تأیید پرداخت
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            اگر از درگاه پرداخت بازگشته‌اید، پرداخت شما در حال پردازش است.
            شناسه پرداخت: <span className="font-mono text-sm">{params.id}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/subscription"
              className="btn btn-primary btn-md"
            >
              بازگشت به اشتراک
            </Link>
            <Link
              href="/"
              className="btn btn-secondary btn-md"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
