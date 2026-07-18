'use client';

type ToastItem = {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
  visible: boolean;
};

type ToastDisplayProps = {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
};

const toneClasses: Record<string, string> = {
  error:
    'border-[rgb(var(--color-danger-rgb)/0.4)] bg-[rgb(var(--color-danger-rgb)/0.18)] text-[var(--color-danger)]',
  info: 'border-[rgb(var(--color-info-rgb)/0.4)] bg-[rgb(var(--color-info-rgb)/0.18)] text-[var(--color-info)]',
  success:
    'border-[rgb(var(--color-success-rgb)/0.4)] bg-[rgb(var(--color-success-rgb)/0.18)] text-[var(--color-success)]',
};

function ToneIcon({ tone }: { tone?: 'success' | 'error' | 'info' }) {
  if (tone === 'error') {
    return (
      <svg
        className="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  if (tone === 'info') {
    return (
      <svg
        className="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ToastDisplay({ toasts, removeToast }: ToastDisplayProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex w-dvw max-w-full flex-col items-center gap-2 px-4 sm:bottom-6"
      role="status"
      aria-live="polite"
      aria-label="اعلان‌ها"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="button"
          tabIndex={0}
          onClick={() => removeToast(toast.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              removeToast(toast.id);
            }
          }}
          className={[
            'pointer-events-auto w-full max-w-sm cursor-pointer rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-semibold shadow-[var(--shadow-strong)] backdrop-blur transition-all duration-300',
            toast.visible
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-2 opacity-0 scale-95',
            toneClasses[toast.tone ?? 'success'],
          ].join(' ')}
        >
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10">
              <ToneIcon {...(toast.tone !== null ? { tone: toast.tone } : {})} />
            </span>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
