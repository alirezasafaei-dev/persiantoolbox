'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/shared/ui/toast-context';

export default function ServiceWorkerRegistration() {
  const deferredInstallPrompt = useRef<Event | null>(null);
  const didReload = useRef(false);
  const waitingWorker = useRef<ServiceWorker | null>(null);
  const { showToast } = useToast();
  const [updateReady, setUpdateReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installPromptReady, setInstallPromptReady] = useState(false);

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
      if (message.type === 'OFFLINE_READY') {
        setOfflineReady(true);
        showToast('نسخه آفلاین آماده استفاده است', 'success');
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

        const active = registration.active;
        if (active) {
          active.postMessage({ type: 'GET_CACHE_INFO' });
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

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredInstallPrompt.current = event;
      setInstallPromptReady(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    register();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', listenForMessages);
    };
  }, [showToast]);

  const activateUpdate = () => {
    waitingWorker.current?.postMessage({ type: 'SKIP_WAITING' });
    setUpdateReady(false);
  };

  const installApp = async () => {
    const promptEvent = deferredInstallPrompt.current as
      | (Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> })
      | null;
    if (!promptEvent?.prompt) {
      return;
    }
    await promptEvent.prompt();
    await promptEvent.userChoice;
    deferredInstallPrompt.current = null;
    setInstallPromptReady(false);
  };

  if (!updateReady && !offlineReady && !installPromptReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-0 z-[90] flex justify-center px-4">
      <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-1)]/95 px-4 py-3 shadow-[var(--shadow-strong)] backdrop-blur">
        <div className="text-sm font-semibold text-[var(--text-primary)] space-y-1">
          {updateReady && <div>نسخه جدید جعبه‌ابزار آماده است.</div>}
          {offlineReady && !updateReady && <div>حالت آفلاین آماده استفاده است.</div>}
          {installPromptReady && !updateReady && <div>برای نصب اپ، گزینه نصب را بزنید.</div>}
          {(updateReady || offlineReady) && (
            <div className="text-xs font-normal text-[var(--text-muted)]">
              یادداشت بروزرسانی: بهبود پایداری آفلاین، امنیت هدرها و کنترل لینک‌های داخلی.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {installPromptReady && (
            <button
              type="button"
              onClick={installApp}
              className="btn btn-secondary px-3 py-2 text-xs"
            >
              نصب اپ
            </button>
          )}
          {updateReady && (
            <button
              type="button"
              onClick={activateUpdate}
              className="btn btn-primary px-3 py-2 text-xs"
            >
              بروزرسانی و بارگذاری مجدد
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setUpdateReady(false);
              setOfflineReady(false);
            }}
            className="btn btn-tertiary px-3 py-2 text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
