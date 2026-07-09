import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { siteUrl, buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'پرداخت ناموفق - جعبه ابزار فارسی',
  description:
    'پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید یا از طریق پشتیبانی با ما تماس بگیرید.',
  path: '/payments/failure',
  robots: { index: false, follow: false },
});

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const headersList = await headers();
  const request = new Request(`${siteUrl}/payments/failure`, {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    redirect('/account');
  }

  const errorMessage = searchParams.error ?? 'پرداخت ناموفق بود';

  return (
    <SiteShell containerClassName="py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-strong)]">
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
              <svg
                className="h-12 w-12 text-[var(--color-danger)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-[var(--text-primary)]">پرداخت ناموفق بود</h1>

          <p className="mb-8 text-lg text-[var(--text-secondary)]">{errorMessage}</p>

          <div className="mb-8 rounded-lg bg-[var(--color-danger)]/5 p-4 text-right">
            <p className="text-sm text-[var(--text-primary)]">دلایل احتمالی:</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
              <li>• کارت بانکی موجودی کافی ندارد</li>
              <li>• ارتباط با درگاه پرداخت قطع شده است</li>
              <li>• زمان پرداخت منقضی شده است</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full rounded-lg bg-[var(--color-danger)] py-3 px-6 font-semibold text-[var(--text-inverted)] transition hover:opacity-90"
            >
              تلاش مجدد
            </Link>
            <Link
              href="/"
              className="block w-full rounded-lg border border-[var(--border-light)] bg-[var(--surface-2)] py-3 px-6 font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-3)]"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>

          <div className="mt-8 border-t border-[var(--border-light)] pt-8">
            <p className="text-sm text-[var(--text-muted)]">
              اگر مشکل ادامه داشت، از طریق{' '}
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
