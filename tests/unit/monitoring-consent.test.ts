import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ANALYTICS_ID = process.env['NEXT_PUBLIC_ANALYTICS_ID'];

beforeEach(() => {
  vi.resetModules();
  process.env['NEXT_PUBLIC_ANALYTICS_ID'] = 'analytics-id';
});

afterEach(() => {
  if (typeof ORIGINAL_ANALYTICS_ID === 'string') {
    process.env['NEXT_PUBLIC_ANALYTICS_ID'] = ORIGINAL_ANALYTICS_ID;
  } else {
    delete process.env['NEXT_PUBLIC_ANALYTICS_ID'];
  }
  vi.unstubAllGlobals();
  vi.doUnmock('@/shared/consent/adsConsent');
});

describe('analytics consent gating', () => {
  it('does not send events without consent', async () => {
    const sendBeacon = vi.fn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(window.navigator, 'sendBeacon', {
      value: sendBeacon,
      configurable: true,
    });

    vi.doMock('@/shared/consent/adsConsent', () => ({
      getAdsConsent: () => ({
        contextualAds: false,
        targetedAds: false,
        updatedAt: null,
        version: 1,
      }),
    }));

    const { analytics } = await import('@/lib/monitoring');
    analytics.trackEvent('page_view');
    window.dispatchEvent(new Event('pagehide'));

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends events when consent is granted', async () => {
    const sendBeacon = undefined;
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(window.navigator, 'sendBeacon', {
      value: sendBeacon,
      configurable: true,
    });

    vi.doMock('@/shared/consent/adsConsent', () => ({
      getAdsConsent: () => ({
        contextualAds: true,
        targetedAds: false,
        updatedAt: Date.now(),
        version: 1,
      }),
    }));

    const { analytics } = await import('@/lib/monitoring');
    analytics.trackEvent('page_view');
    window.dispatchEvent(new Event('pagehide'));

    expect(fetchMock).toHaveBeenCalledOnce();
    const calls = fetchMock.mock.calls as unknown as Array<[unknown, RequestInit?]>;
    const requestInit = calls[0]?.[1];
    expect(requestInit).toBeTruthy();
    const payload = JSON.parse(String(requestInit?.body ?? '')) as {
      events: Array<{ metadata?: Record<string, unknown> }>;
    };
    expect(payload.events[0]?.metadata?.['consentGranted']).toBe(true);
  });
});
