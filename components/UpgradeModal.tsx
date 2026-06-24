'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const basicPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'basic_monthly');
  const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'pro_monthly');

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

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

  const resetDisplay = resetTime === 'فردا' ? 'فردا' : resetTime;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="ارتقای حساب"
        className="w-full max-w-md rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-2xl"
        dir="rtl"
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            به محدودیت استفاده رسیدید
          </h2>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="بستن"
            className="text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-[var(--color-primary)]/10 p-4">
          <p className="text-sm text-[var(--color-primary)]">
            شما امروز <span className="font-bold">{remainingUses}</span> استفاده رایگان باقی‌مانده
            دارید.
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            محدودیت {resetDisplay} بازنشانی می‌شود.
          </p>
        </div>

        <div className="mb-6 space-y-3">
          {basicPlan && (
            <button
              type="button"
              onClick={() => handleUpgrade(basicPlan.id)}
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--color-primary)] py-3 px-6 font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? 'در حال پردازش...'
                : `ارتقا به پایه (${basicPlan.price.toLocaleString('fa-IR')} تومان/ماه)`}
            </button>
          )}
          {proPlan && (
            <button
              type="button"
              onClick={() => handleUpgrade(proPlan.id)}
              disabled={isLoading}
              className="w-full rounded-lg border border-[var(--border-light)] bg-[var(--surface-2)] py-3 px-6 font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? 'در حال پردازش...'
                : `ارتقا به حرفه‌ای (${proPlan.price.toLocaleString('fa-IR')} تومان/ماه)`}
            </button>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            بعداً
          </button>
        </div>

        <div className="mt-6 border-t border-[var(--border-light)] pt-6">
          <p className="text-center text-sm text-[var(--text-muted)]">با ارتقا به Premium:</p>
          <ul className="mt-2 space-y-1 text-right text-sm text-[var(--text-secondary)]">
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
