'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/shared/ui/toast-context';

export default function ServiceWorkerRegistration() {
  const didReload = useRef(false);
  const waitingWorker = useRef<ServiceWorker | null>(null);
  const { showToast } = useToast();
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const onControllerChange = () => {
      if (didReload.current) {
        return;
      }
      didReload.current = true;
      window.location.reload();
    };

    const listenForMessages = (event: MessageEvent) => {
      const message = event.data;
      if (!message?.type) {
        return;
      }

      if (message.type === 'UPDATE_AVAILABLE') {
        setUpdateReady(true);
        showToast('به‌روزرسانی جدید آماده نصب است', 'info');
      }
      if (message.type === 'UPDATED') {
        showToast('جعبه‌ابزار به‌روز شد', 'success');
      }
    };

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        if (registration.waiting) {
          waitingWorker.current = registration.waiting;
          setUpdateReady(true);
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorker.current = registration.waiting ?? installing;
              setUpdateReady(true);
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
        navigator.serviceWorker.addEventListener('message', listenForMessages);
      } catch {
        // Silent fail to avoid blocking UX in unsupported environments
      }
    };

    register();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', listenForMessages);
    };
  }, [showToast]);

  const activateUpdate = () => {
    waitingWorker.current?.postMessage({ type: 'SKIP_WAITING' });
    setUpdateReady(false);
  };

  if (!updateReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-0 z-[90] flex justify-center px-4">
      <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-1)]/95 px-4 py-3 shadow-[var(--shadow-strong)] backdrop-blur">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          نسخه جدید جعبه‌ابزار آماده است.
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={activateUpdate}
            className="btn btn-primary px-3 py-2 text-xs"
          >
            بروزرسانی و بارگذاری مجدد
          </button>
          <button
            type="button"
            onClick={() => setUpdateReady(false)}
            className="btn btn-tertiary px-3 py-2 text-xs"
          >
            بعدا
          </button>
        </div>
      </div>
    </div>
  );
}
