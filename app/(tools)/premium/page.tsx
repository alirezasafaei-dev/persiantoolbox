/**
 * Premium Page
 * Shows pricing plans and upgrade options
 */

import { headers } from 'next/headers';
import { getUserFromRequest } from '@/lib/server/auth';
import { redirect } from 'next/navigation';

export default async function PremiumPage() {
  const headersList = await headers();
  const request = new Request('https://persiantoolbox.ir/premium', {
    headers: headersList,
  });
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    redirect('/account?redirect=/premium');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ارتقا به PersianToolbox Premium</h1>
          <p className="text-xl text-gray-600">دسترسی نامحدود به تمام ابزارها بدون محدودیت</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">رایگان</h2>
            <div className="text-4xl font-bold text-gray-900 mb-6">0 تومان</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>51+ ابزار رایگان</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>محدودیت استفاده روزانه</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>تبلیغات</span>
              </li>
              <li className="flex items-center text-gray-400">
                <span className="mr-2">✗</span>
                <span>خروجی با watermark</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full py-3 px-6 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
            >
              طرح فعلی شما
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-purple-500 transform scale-105">
            <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              محبوب‌ترین
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
            <div className="text-4xl font-bold text-purple-600 mb-6">
              ۱۹۰,۰۰۰ <span className="text-lg text-gray-600">تومان/ماه</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>استفاده نامحدود</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>بدون تبلیغات</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>خروجی حرفه‌ای بدون watermark</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>پردازش batch (چند فایل همزمان)</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>پشتیبانی اولویت‌دار</span>
              </li>
            </ul>
            <button
              onClick={async () => {
                const response = await fetch('/api/payments/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: 190000,
                    method: 'zarinpal',
                    description: 'PersianToolbox Premium Subscription - Monthly',
                  }),
                });
                const data = await response.json();
                if (data.checkoutUrl) {
                  window.location.href = data.checkoutUrl;
                }
              }}
              className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              ارتقا به Premium
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              ۴۹۰,۰۰۰ <span className="text-lg text-gray-600">تومان/ماه</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>همه امکانات Premium</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>API access</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Custom branding</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>پشتیبانی اختصاصی</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>دسترسی زودتر به ویژگی‌های جدید</span>
              </li>
            </ul>
            <button
              onClick={async () => {
                const response = await fetch('/api/payments/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: 490000,
                    method: 'zarinpal',
                    description: 'PersianToolbox Pro Subscription - Monthly',
                  }),
                });
                const data = await response.json();
                if (data.checkoutUrl) {
                  window.location.href = data.checkoutUrl;
                }
              }}
              className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              ارتقا به Pro
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            با اشتراک Premium، از تمام ابزارها بدون محدودیت استفاده کنید
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <span>✓ لغو در هر زمان</span>
            <span>✓ ضمانت بازگشت وجه ۷ روزه</span>
            <span>✓ پشتیبانی ۲۴/۷</span>
          </div>
        </div>
      </div>
    </div>
  );
}
