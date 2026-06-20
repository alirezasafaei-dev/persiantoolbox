/**
 * Payment Success Page
 * Shows after successful payment completion
 */

import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { paymentId?: string };
}) {
  const headersList = await headers();
  const request = new Request('https://persiantoolbox.ir/payments/success', {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    redirect('/account');
  }

  const paymentId = searchParams.paymentId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">پرداخت موفق بود! 🎉</h1>

          <p className="text-lg text-gray-600 mb-8">
            اشتراک Premium شما فعال شد. حالا می‌توانید از تمام امکانات Premium استفاده کنید.
          </p>

          {paymentId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                شناسه پرداخت: <span className="font-mono font-semibold">{paymentId}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              شروع استفاده
            </Link>
            <Link
              href="/account"
              className="block w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              مدیریت اشتراک
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              اگر سوالی دارید، از طریق{' '}
              <Link href="/contact" className="text-green-600 hover:underline">
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
