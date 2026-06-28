'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { getDisplayToolsCount } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '@/shared/analytics/events';

const USAGE_KEY = 'persiantoolbox.usage.count';
const CTA_DISMISSED_KEY = 'persiantoolbox.cta.dismissed';
const EXIT_DISMISSED_KEY = 'persiantoolbox.exit.dismissed';

function getUsageCount(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  try {
    return parseInt(localStorage.getItem(USAGE_KEY) ?? '0', 10);
  } catch {
    return 0;
  }
}

export function incrementUsage(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const count = getUsageCount() + 1;
    localStorage.setItem(USAGE_KEY, String(count));
  } catch {
    // ignore
  }
}

export function SmartCTA() {
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    setCount(getUsageCount());
    try {
      setDismissed(localStorage.getItem(CTA_DISMISSED_KEY) === '1');
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(CTA_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  if (dismissed) {
    return null;
  }

  if (count === 0 && isHomepage) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-40 animate-slide-up">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-lg">
              👋
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)]">
                ابزارهای ما را امتحان کنید!
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                بیش از {toPersianNumbers(getDisplayToolsCount())} ابزار رایگان و آنلاین در اختیار
                شماست.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/tools"
                  onClick={() =>
                    trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'fab-zero' })
                  }
                >
                  <Button size="sm">مشاهده همه ابزارها</Button>
                </Link>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  بعداً
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="بستن"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (count >= 5) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-40 animate-slide-up">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-primary)]/20 bg-[var(--surface-1)] p-4 shadow-[var(--shadow-strong)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-lg">
              ⭐
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)]">پریمیوم شوید!</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                با اشتراک پریمیوم به تمام ابزارها بدون محدودیت دسترسی داشته باشید.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/pricing"
                  onClick={() =>
                    trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'fab-premium' })
                  }
                >
                  <Button size="sm">مشاهده پلن‌ها</Button>
                </Link>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  نه متشکرم
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="بستن"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (count >= 3) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-40 animate-slide-up">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-lg">
              🧰
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)]">حساب کاربری بسازید</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                نتایج محاسبات خود را ذخیره و مدیریت کنید.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/account"
                  onClick={() =>
                    trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'fab-account' })
                  }
                >
                  <Button size="sm">ثبت‌نام رایگان</Button>
                </Link>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  بعداً
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="بستن"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (localStorage.getItem(EXIT_DISMISSED_KEY) === '1') {
        dismissedRef.current = true;
        return;
      }
    } catch {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (dismissedRef.current) {
        return;
      }
      if (e.clientY <= 0) {
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    dismissedRef.current = true;
    try {
      localStorage.setItem(EXIT_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <button
        type="button"
        onClick={handleDismiss}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleDismiss();
          }
        }}
        className="absolute inset-0"
        aria-label="بستن"
      />
      <div className="relative mx-4 w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-strong)]">
        <div className="text-center space-y-4">
          <div className="text-5xl">🧰</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            ابزارهای بیشتری کشف کنید!
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            بیش از {toPersianNumbers(getDisplayToolsCount())} ابزار رایگان برای کار و زندگی.
            ابزارهای مالی، PDF، تصویر و متنی.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/tools"
              onClick={() => {
                handleDismiss();
                trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'exit-popup' });
              }}
            >
              <Button fullWidth>مشاهده همه ابزارها</Button>
            </Link>
            <Link
              href="/blog"
              onClick={() => {
                handleDismiss();
                trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'exit-popup' });
              }}
            >
              <Button variant="secondary" fullWidth>
                مقالات آموزشی
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
