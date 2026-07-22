'use client';

export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-10 text-center shadow-[var(--shadow-subtle)] space-y-5">
        <svg
          className="mx-auto h-16 w-16 text-[var(--color-error)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">خطا در بارگذاری قیمت‌ها</h2>
        <p className="text-sm text-[var(--text-muted)] leading-7">
          متأسفانه مشکلی در نمایش طرح‌های اشتراک پیش آمده است. لطفاً دوباره تلاش کنید.
        </p>
        {error.digest ? (
          <p className="text-xs text-[var(--text-muted)]">کد خطا: {error.digest}</p>
        ) : null}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button type="button" onClick={reset} className="btn btn-primary btn-md w-full">
            تلاش مجدد
          </button>
          <a href="/" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  );
}
