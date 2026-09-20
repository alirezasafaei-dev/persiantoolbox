'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsentState,
} from '@/shared/consent/analyticsConsent';
import { HOME_PRIVACY_ANSWER } from '@/lib/home-copy';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
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
    const state: AnalyticsConsentState = {
      ad_storage: true,
      ad_user_data: true,
      ad_personalization: true,
      analytics_storage: true,
      version: 'v2',
    };
    writeAnalyticsConsent(state);
    updateConsentGranted();
    setShowBanner(false);
  }, []);

  const handleReject = useCallback(() => {
    const state: AnalyticsConsentState = {
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: false,
      version: 'v2',
    };
    writeAnalyticsConsent(state);
    updateConsentDenied();
    setShowBanner(false);
  }, []);

  useEffect(() => {
    const existing = readAnalyticsConsent();
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
      <div className="mx-auto max-w-2xl rounded-lg border border-(--border-light) bg-(--surface-1) p-5 shadow-medium">
        <p className="text-sm font-bold text-(--text-primary)">حریم خصوصی و کوکی‌ها</p>
        <p className="mt-2 text-xs leading-5 text-(--text-muted)">
          ما از کوکی‌ها برای بهبود تجربه کاربری و تحلیل بازدید استفاده می‌کنیم.{' '}
          {HOME_PRIVACY_ANSWER}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAccept}
            aria-label="پذیرش همه کوکی‌ها"
            className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-(--text-inverted) transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-1)"
          >
            پذیرش همه
          </button>
          <button
            type="button"
            onClick={handleReject}
            aria-label="رد همه کوکی‌ها"
            className="rounded-full border border-(--border-light) bg-(--surface-2) px-4 py-2 text-xs font-semibold text-(--text-secondary) transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-1)"
          >
            رد همه
          </button>
        </div>
      </div>
    </div>
  );
}
