'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_KEY,
  readAnalyticsConsent,
  type AnalyticsConsentState,
} from '@/shared/consent/analyticsConsent';
import { getPlausibleScriptUrl, isPlausiblePilotEnabled } from '@/lib/analytics/plausibleConfig';
import { buildPlausiblePageUrl } from '@/shared/analytics/plausible';

type PlausibleQueue = NonNullable<Window['plausible']>;

function initializePlausibleQueue(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.plausible !== 'function') {
    const plausible: PlausibleQueue = (...args: unknown[]) => {
      plausible.q = plausible.q ?? [];
      plausible.q.push(args);
    };
    plausible.init = (options = {}) => {
      plausible.o = options;
    };
    window.plausible = plausible;
  }

  window.plausible.init?.({
    autoCapturePageviews: false,
    outboundLinks: false,
    fileDownloads: false,
    formSubmissions: false,
  });
}

export default function PlausibleAnalytics() {
  const pathname = usePathname();
  const enabled = isPlausiblePilotEnabled();
  const scriptUrl = getPlausibleScriptUrl();
  const [hasConsent, setHasConsent] = useState(false);
  const [queueReady, setQueueReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const syncConsent = () => {
      setHasConsent(readAnalyticsConsent()?.analytics_storage === true);
    };
    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsConsentState>).detail;
      setHasConsent(detail?.analytics_storage === true);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_CONSENT_KEY) {
        syncConsent();
      }
    };

    syncConsent();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hasConsent) {
      return;
    }
    initializePlausibleQueue();
    setQueueReady(true);
  }, [enabled, hasConsent]);

  useEffect(() => {
    if (!enabled || !hasConsent || !queueReady || !pathname) {
      return;
    }
    window.plausible?.('pageview', {
      url: buildPlausiblePageUrl(pathname, window.location.href),
    });
  }, [enabled, hasConsent, pathname, queueReady]);

  if (!enabled || !scriptUrl || !hasConsent || !queueReady) {
    return null;
  }

  return <Script id="plausible-analytics" src={scriptUrl} strategy="afterInteractive" />;
}
