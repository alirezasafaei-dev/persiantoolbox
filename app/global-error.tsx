'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <div className="flex min-h-screen items-center justify-center p-6 bg-[var(--bg-primary)]">
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl">💥</div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">خطای بحرانی</h2>
            <p className="text-[var(--text-muted)] leading-7">
              برنامه با خطای غیرمنتظره‌ای مواجه شد. لطفاً صفحه را رفرش کنید.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-transparent bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
            >
              رفرش صفحه
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
