'use client';

import { useState } from 'react';
import Link from 'next/link';

type Props = {
  message?: string;
  className?: string;
};

export default function UpgradePrompt({
  message = 'برای خروجی بدون واترمارک ارتقا دهید',
  className,
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.05)] p-3 ${className ?? ''}`}
    >
      <p className="text-xs text-[var(--color-primary)] font-semibold">{message}</p>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
        >
          ارتقا
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="بستن"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
