'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'pt-consent';
const CONSENT_VERSION = 'v2';

type ConsentState = {
  ad_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
  analytics_storage: boolean;
  version: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable */
  }
}

function setConsentDefaults() {
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

function updateConsentGranted() {
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
}

function updateConsentDenied() {
  if (typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  const handleAccept = useCallback(() => {
    const state: ConsentState = {
      ad_storage: true,
      ad_user_data: true,
      ad_personalization: true,
      analytics_storage: true,
      version: CONSENT_VERSION,
    };
    writeConsent(state);
    updateConsentGranted();
    setShowBanner(false);
  }, []);

  const handleReject = useCallback(() => {
    const state: ConsentState = {
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: false,
      version: CONSENT_VERSION,
    };
    writeConsent(state);
    updateConsentDenied();
    setShowBanner(false);
  }, []);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      if (existing.analytics_storage) {
        updateConsentGranted();
      }
      return;
    }
    setConsentDefaults();
    setShowBanner(true);
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-medium)]">
        <p className="text-sm font-bold text-[var(--text-primary)]">حریم خصوصی و کوکی‌ها</p>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          ما از کوکی‌ها برای بهبود تجربه کاربری و تحلیل بازدید استفاده می‌کنیم. تمام پردازش‌های
          ابزارها در مرورگر شما انجام می‌شود و داده‌های حساس به سرور ارسال نمی‌شوند.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-[var(--text-inverted)] transition-opacity hover:opacity-90"
          >
            پذیرش همه
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary)]"
          >
            رد همه
          </button>
        </div>
      </div>
    </div>
  );
}
