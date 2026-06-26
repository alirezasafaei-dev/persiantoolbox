'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UsageStatus {
  used: number;
  limit: number;
  percentage: number;
  isPremium: boolean;
}

export default function UsageWarning() {
  const [status, setStatus] = useState<UsageStatus | null>(null);

  useEffect(() => {
    fetch('/api/usage/status')
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status || status.isPremium || status.percentage < 80) {
    return null;
  }

  const isAtLimit = status.used >= status.limit;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-md)] border border-[rgb(var(--color-warning-rgb)/0.3)] bg-[rgb(var(--color-warning-rgb)/0.08)] p-3 text-center text-sm text-[var(--color-warning)]"
    >
      {isAtLimit ? (
        <p>
          شما از {status.used}/{status.limit} استفاده روزانه خود را مصرف کرده‌اید.
          <Link
            href="/pricing"
            className="mr-2 font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-2 transition-colors"
          >
            برای استفاده نامحدود، اشتراک تهیه کنید
          </Link>
        </p>
      ) : (
        <p>
          شما از {status.used}/{status.limit} استفاده روزانه خود را مصرف کرده‌اید.
        </p>
      )}
    </div>
  );
}
