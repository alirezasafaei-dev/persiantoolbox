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
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('fetch', vi.fn());
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

    expect(sendBeacon).toHaveBeenCalledOnce();
  });
});
