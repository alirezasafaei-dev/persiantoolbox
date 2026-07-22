'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const COOLDOWN_KEY = 'pt_exit_intent_cooldown';
const COOLDOWN_DAYS = 30;

function isCoolingDown(): boolean {
  try {
    const last = localStorage.getItem(COOLDOWN_KEY);
    if (!last) {
      return false;
    }
    const elapsed = Date.now() - Number(last);
    return elapsed < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}

export default function ExitIntentCta() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    markShown();
  }, []);

  useEffect(() => {
    function onMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0 && !isCoolingDown()) {
        setOpen(true);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        close();
      }
    }

    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="پیشنهاد ویژه"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="بستن پنجره پیشنهاد"
        onClick={close}
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--bg-primary)] p-8 shadow-[var(--shadow-strong)]">
        <button
          type="button"
          onClick={close}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="بستن"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <svg
              className="h-8 w-8 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <h2 className="text-xl font-black text-[var(--text-primary)]">پیشنهاد ویژه برای شما</h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            اکنون بهترین زمان برای ارتقاء به نسخه حرفه‌ای است. خروج از محدودیت‌ها و دسترسی کامل به
            تمام ابزارها.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/pricing"
              onClick={close}
              className="block w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] hover:opacity-90 transition-opacity"
            >
              مشاهده طرح‌های اشتراک
            </Link>
            <button
              type="button"
              onClick={close}
              className="block w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              شاید بعداً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
