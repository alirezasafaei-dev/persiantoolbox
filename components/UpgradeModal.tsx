'use client';

/**
 * Upgrade Modal
 * Shows when user hits usage limits
 */

import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingUses: number;
  resetTime: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  remainingUses,
  resetTime,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const basicPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'basic_monthly');
  const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'pro_monthly');

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();
      if (data.ok && data.payUrl) {
        window.location.href = data.payUrl;
      }
    } catch (error) {
      console.error('Payment checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-right">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">به محدودیت استفاده رسیدید</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            شما امروز <span className="font-bold">{remainingUses}</span> استفاده رایگان باقی‌مانده
            دارید.
          </p>
          <p className="text-blue-600 text-sm mt-2">
            محدودیت در ساعت {new Date(resetTime).toLocaleTimeString('fa-IR')} reset می‌شود
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {basicPlan && (
            <button
              onClick={() => handleUpgrade(basicPlan.id)}
              disabled={isLoading}
              className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'در حال پردازش...'
                : `ارتقا به پایه (${basicPlan.price.toLocaleString('fa-IR')} تومان/ماه)`}
            </button>
          )}

          {proPlan && (
            <button
              onClick={() => handleUpgrade(proPlan.id)}
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'در حال پردازش...'
                : `ارتقا به حرفه‌ای (${proPlan.price.toLocaleString('fa-IR')} تومان/ماه)`}
            </button>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <button onClick={onClose} className="hover:text-gray-700 transition">
            بعداً
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">با ارتقا به Premium:</p>
          <ul className="text-sm text-gray-500 mt-2 space-y-1 text-right">
            <li>✓ استفاده نامحدود از همه ابزارها</li>
            <li>✓ بدون تبلیغات</li>
            <li>✓ خروجی حرفه‌ای بدون watermark</li>
            <li>✓ پردازش batch (چند فایل همزمان)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
