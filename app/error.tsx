'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">خطایی رخ داد</h2>
        <p className="text-[var(--text-muted)] leading-7">
          متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.
        </p>
        {error.digest && <p className="text-xs text-[var(--text-muted)]">کد خطا: {error.digest}</p>}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-transparent bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:brightness-110"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
