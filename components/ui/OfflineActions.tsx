'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function OfflineActions() {
  const [cacheVersion, setCacheVersion] = useState<string>('unknown');
  const [storageUsage, setStorageUsage] = useState<string>('نامشخص');

  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        const keys = await caches.keys();
        const shell = keys.find((key) => key.startsWith('persian-tools-shell-'));
        if (shell) {
          setCacheVersion(shell.replace('persian-tools-shell-', ''));
        }
      } catch {
        setCacheVersion('unknown');
      }

      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const usage = estimate.usage ?? 0;
          const quota = estimate.quota ?? 0;
          if (quota > 0) {
            const percent = ((usage / quota) * 100).toFixed(1);
            setStorageUsage(`${percent}%`);
          } else {
            setStorageUsage(`${Math.round(usage / 1024)}KB`);
          }
        }
      } catch {
        setStorageUsage('نامشخص');
      }
    };

    void loadDiagnostics();
  }, []);

  const onRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const onClearCache = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHES' });
    }
    window.location.reload();
  }, []);

  const onCheckUpdate = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-xs text-[var(--text-secondary)]">
        <div>نسخه کش آفلاین: {cacheVersion}</div>
        <div>مصرف تقریبی فضای ذخیره‌سازی: {storageUsage}</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRetry} className="btn btn-primary px-6 py-2 text-sm">
          تلاش مجدد
        </button>
        <button type="button" onClick={onClearCache} className="btn btn-tertiary px-6 py-2 text-sm">
          پاک‌سازی کش
        </button>
        <button
          type="button"
          onClick={onCheckUpdate}
          className="btn btn-secondary px-6 py-2 text-sm"
        >
          بررسی بروزرسانی
        </button>
        <Link href="/" className="btn btn-secondary px-6 py-2 text-sm">
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}
