'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function ServiceWorkerRegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('SW registered:', registration.scope);
        }
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });

    if ('PushManager' in window) {
      navigator.serviceWorker
        .register('/sw-push.js')
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Push SW registered:', registration.scope);
          }
        })
        .catch((error) => {
          console.error('Push SW registration failed:', error);
        });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstall(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstall(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-install-dismissed', '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowInstall(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  }, []);

  if (isInstalled || !showInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-slide-up">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)]">نصب اپلیکیشن</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              جعبه ابزار فارسی را روی گوشی خود نصب کنید تا سریع‌تر به ابزارها دسترسی داشته باشید.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                نصب
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                نه متشکرم
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="بستن"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
