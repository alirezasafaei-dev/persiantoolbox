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
            <svg
              className="mx-auto h-16 w-16 text-[var(--color-danger)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">خطای بحرانی</h2>
            <p className="text-[var(--text-muted)] leading-7">
              برنامه با خطای غیرمنتظره‌ای مواجه شد. لطفاً دوباره تلاش کنید.
            </p>
            {error.digest ? (
              <p className="text-xs text-[var(--text-muted)]">کد خطا: {error.digest}</p>
            ) : null}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-transparent bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
              >
                تلاش مجدد
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
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
