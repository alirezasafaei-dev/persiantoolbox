/**
 * Self-hosted analytics for privacy-first monitoring
 * No user data is sent to external services
 */
import { getAdsConsent } from '@/shared/consent/adsConsent';

type EventData = {
  event: string;
  timestamp: number;
  path: string;
  metadata?: Record<string, unknown>;
};

export class AnalyticsClient {
  private static instance: AnalyticsClient;
  private events: EventData[] = [];
  private readonly maxEvents = 100;
  private readonly endpoint = process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT'] ?? '/api/analytics';
  private readonly enabled = Boolean(process.env['NEXT_PUBLIC_ANALYTICS_ID']);

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupBeaconOnUnload();
    }
  }

  static getInstance(): AnalyticsClient {
    if (!AnalyticsClient.instance) {
      AnalyticsClient.instance = new AnalyticsClient();
    }
    return AnalyticsClient.instance;
  }

  private hasConsent(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return getAdsConsent().contextualAds;
  }

  trackEvent(eventName: string, metadata?: Record<string, unknown>): void {
    if (!this.enabled) {
      return;
    }
    const consent = getAdsConsent();
    if (!consent.contextualAds) {
      return;
    }

    const event: EventData = {
      event: eventName,
      timestamp: Date.now(),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      metadata: {
        consentGranted: true,
        consentVersion: consent.version,
        ...(metadata ?? {}),
      },
    };

    this.events.push(event);

    if (this.events.length >= this.maxEvents) {
      this.flushEvents();
    }
  }

  private flushEvents(): void {
    if (!this.enabled || !this.hasConsent() || this.events.length === 0) {
      this.events = [];
      return;
    }

    const payload = JSON.stringify({
      id: process.env['NEXT_PUBLIC_ANALYTICS_ID'],
      events: this.events,
    });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
      this.events = [];
      return;
    }

    if (typeof fetch === 'function') {
      void fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    }
    this.events = [];
  }

  private setupBeaconOnUnload(): void {
    if (typeof window !== 'undefined') {
      const flush = () => {
        this.flushEvents();
      };
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flush();
        }
      });
    }
  }
}

export const analytics = AnalyticsClient.getInstance();
