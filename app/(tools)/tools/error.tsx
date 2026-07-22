'use client';

import Link from 'next/link';

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          بارگذاری ابزار با خطا مواجه شد
        </h2>
        <p className="text-[var(--text-muted)] leading-7">
          مشکلی در بارگذاری این ابزار پیش آمد. لطفاً دوباره تلاش کنید یا ابزارهای دیگر را مشاهده
          کنید.
        </p>
        {error.digest ? (
          <p className="text-xs text-[var(--text-muted)]">کد خطا: {error.digest}</p>
        ) : null}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-transparent bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:brightness-110"
          >
            تلاش مجدد
          </button>
          <Link href="/tools" className="btn btn-outline btn-md w-full">
            مشاهده ابزارها
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
