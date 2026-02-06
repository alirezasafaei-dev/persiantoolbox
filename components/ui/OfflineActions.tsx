'use client';

import Link from 'next/link';
import { useCallback } from 'react';

export default function OfflineActions() {
  const onRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const onClearCache = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHES' });
    }
    window.location.reload();
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button type="button" onClick={onRetry} className="btn btn-primary px-6 py-2 text-sm">
        تلاش مجدد
      </button>
      <button type="button" onClick={onClearCache} className="btn btn-tertiary px-6 py-2 text-sm">
        پاک‌سازی کش
      </button>
      <Link href="/" className="btn btn-secondary px-6 py-2 text-sm">
        بازگشت به خانه
      </Link>
    </div>
  );
}
