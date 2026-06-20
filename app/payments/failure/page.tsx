/**
 * Payment Failure Page
 * Shows after failed payment
 */

import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const headersList = await headers();
  const request = new Request('https://persiantoolbox.ir/payments/failure', {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    redirect('/account');
  }

  const errorMessage = searchParams.error ?? 'پرداخت ناموفق بود';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-red-600"
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

          <h1 className="text-3xl font-bold text-gray-900 mb-4">پرداخت ناموفق بود</h1>

          <p className="text-lg text-gray-600 mb-8">{errorMessage}</p>

          <div className="bg-red-50 rounded-lg p-4 mb-8 text-right">
            <p className="text-sm text-gray-700">دلایل احتمالی:</p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• کارت بانکی موجودی کافی ندارد</li>
              <li>• ارتباط با درگاه پرداخت قطع شده است</li>
              <li>• زمان پردایت منقضی شده است</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/premium"
              className="block w-full py-3 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              تلاش مجدد
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              اگر مشکل ادامه داشت، از طریق{' '}
              <Link href="/contact" className="text-red-600 hover:underline">
                صفحه تماس با ما
              </Link>{' '}
              با ما در ارتباط باشید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
