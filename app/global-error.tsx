'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <div
          className="flex min-h-screen items-center justify-center p-6 bg-[var(--bg-primary)]"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl">💥</div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">خطای بحرانی</h2>
            <p className="text-[var(--text-muted)] leading-7">
              برنامه با خطای غیرمنتظره‌ای مواجه شد. لطفاً دوباره تلاش کنید.
            </p>
            {error.digest && (
              <p className="text-xs text-[var(--text-muted)]">کد خطا: {error.digest}</p>
            )}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-transparent bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:brightness-110"
              >
                تلاش مجدد
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                بازگشت به صفحه اصلی
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
