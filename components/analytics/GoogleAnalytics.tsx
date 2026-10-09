'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getGa4MeasurementId, isGa4Enabled } from '@/lib/analytics/ga4Config';
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_KEY,
  readAnalyticsConsent,
  type AnalyticsConsentState,
} from '@/shared/consent/analyticsConsent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const PRIVATE_ROUTES = [
  '/admin',
  '/account',
  '/dashboard',
  '/checkout',
  '/subscription',
  '/auth',
  '/favorites',
  '/history',
  '/payments',
];

function safeReferrer(): string {
  try {
    const url = new URL(document.referrer);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : '';
  } catch {
    return '';
  }
}

export default function GoogleAnalytics({ nonce }: { nonce?: string | undefined }) {
  const pathname = usePathname();
  const id = getGa4MeasurementId();
  const enabled = isGa4Enabled();
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);
  const lastPage = useRef<string | null>(null);
  const privateRoute = PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`),
  );

  useEffect(() => {
    if (!enabled || !id) {
      return;
    }
    const apply = (allowed: boolean) => {
      window[`ga-disable-${id}`] = !allowed;
      if (!allowed) {
        lastPage.current = null;
        for (let index = (window.dataLayer?.length ?? 0) - 1; index >= 0; index--) {
          const command = window.dataLayer?.[index] as ArrayLike<unknown> | undefined;
          if (command?.[0] === 'event') {
            window.dataLayer?.splice(index, 1);
          }
        }
      }
      if (initialized.current) {
        window.gtag?.('consent', 'update', {
          analytics_storage: allowed ? 'granted' : 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
      setConsent(allowed);
    };
    const sync = () => apply(readAnalyticsConsent()?.analytics_storage === true);
    const changed = (event: Event) =>
      apply((event as CustomEvent<AnalyticsConsentState>).detail?.analytics_storage === true);
    const storage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_CONSENT_KEY || event.key === null) {
        sync();
      }
    };
    sync();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, changed);
    window.addEventListener('storage', storage);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, changed);
      window.removeEventListener('storage', storage);
      window[`ga-disable-${id}`] = true;
    };
  }, [enabled, id]);

  useEffect(() => {
    if (!enabled || !id || !consent || !pathname) {
      return;
    }
    window[`ga-disable-${id}`] = privateRoute;
    if (privateRoute) {
      lastPage.current = null;
      return;
    }
    if (!initialized.current) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = function (...args: unknown[]) {
        if (args[0] === 'event' && window[`ga-disable-${id}`] !== false) {
          return;
        }
        window.dataLayer?.push(arguments);
      };
      window.gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      window.gtag('js', new Date());
      window.gtag('config', id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: new URL(pathname, window.location.origin).href,
        page_referrer: safeReferrer(),
        page_title: '',
      });
      initialized.current = true;
      setReady(true);
    }
    if (lastPage.current !== pathname) {
      window.gtag?.('event', 'page_view', {
        send_to: id,
        page_location: new URL(pathname, window.location.origin).href,
        page_title: '',
        page_referrer: safeReferrer(),
      });
      lastPage.current = pathname;
    }
  }, [enabled, id, consent, pathname, privateRoute]);

  if (!enabled || !id || !consent || !ready || privateRoute) {
    return null;
  }
  return (
    <Script
      id="ga4-analytics"
      nonce={nonce}
      src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      strategy="afterInteractive"
    />
  );
}
