import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { siteUrl } from '@/lib/seo';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { paymentId?: string };
}) {
  const headersList = await headers();
  const request = new Request(`${siteUrl}/payments/success`, {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    redirect('/account');
  }

  const paymentId = searchParams.paymentId;

  return (
    <SiteShell containerClassName="py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-2xl">
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success)]/10">
              <svg className="h-12 w-12 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">پرداخت موفق بود!</h1>

          <p className="mb-8 text-lg text-[var(--text-secondary)]">
            اشتراک Premium شما فعال شد. حالا می‌توانید از تمام امکانات Premium استفاده کنید.
          </p>

          {paymentId && (
            <div className="mb-8 rounded-lg bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                شناسه پرداخت: <span className="font-mono font-semibold">{paymentId}</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full rounded-lg bg-[var(--color-success)] py-3 px-6 font-semibold text-white transition hover:opacity-90"
            >
              شروع استفاده
            </Link>
            <Link
              href="/account"
              className="block w-full rounded-lg border border-[var(--border-light)] bg-[var(--surface-2)] py-3 px-6 font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-3)]"
            >
              مدیریت اشتراک
            </Link>
          </div>

          <div className="mt-8 border-t border-[var(--border-light)] pt-8">
            <p className="text-sm text-[var(--text-muted)]">
              اگر سوالی دارید، از طریق{' '}
              <Link href="/support" className="text-[var(--color-primary)] hover:underline">
                صفحه پشتیبانی
              </Link>{' '}
              با ما در ارتباط باشید.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
