import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('@/shared/consent/adsConsent');
});

describe('ad analytics privacy guardrails', () => {
  it('does not record ad events without consent', async () => {
    vi.doMock('@/shared/consent/adsConsent', () => ({
      getAdsConsent: () => ({
        contextualAds: false,
        targetedAds: false,
        updatedAt: null,
        version: 1,
      }),
    }));

    const { recordAdView, getAdEvents } = await import('@/shared/analytics/ads');
    recordAdView('slot-main', 'campaign-main');

    expect(getAdEvents().length).toBe(0);
  });

  it('records only sanitized ids and generates aggregated report', async () => {
    vi.doMock('@/shared/consent/adsConsent', () => ({
      getAdsConsent: () => ({
        contextualAds: true,
        targetedAds: false,
        updatedAt: Date.now(),
        version: 1,
      }),
    }));

    const {
      recordAdView,
      recordAdClick,
      recordAdConsentAction,
      getAdEvents,
      getAdPerformanceReport,
      exportAdPerformanceReport,
    } = await import('@/shared/analytics/ads');

    history.pushState({}, '', '/ads?email=user@example.com#debug');

    const noisyId = `slot-${'x'.repeat(200)}`;
    const noisyCampaign = `campaign-${'y'.repeat(200)}`;
    recordAdConsentAction('accept', 'settings', noisyId, 'Variant B #2026');
    recordAdView(noisyId, noisyCampaign, 'Variant B #2026');
    recordAdView(noisyId, noisyCampaign, 'Variant B #2026');
    recordAdClick(noisyId, noisyCampaign, 'Variant B #2026');
    recordAdConsentAction('decline', 'banner', noisyId, 'Variant B #2026');

    const events = getAdEvents();
    expect(events.length).toBe(5);
    const firstView = events.find((event) => event.type === 'view');
    expect(firstView?.slotId?.length).toBeLessThanOrEqual(80);
    expect(firstView?.campaignId?.length).toBeLessThanOrEqual(80);
    expect(firstView?.variantId).toBe('variant-b--2026');
    expect(firstView?.path).toBe('/ads');

    const report = getAdPerformanceReport(30);
    expect(report.totals.views).toBe(2);
    expect(report.totals.clicks).toBe(1);
    expect(report.totals.ctr).toBe(50);
    expect(report.totals.variants).toBe(1);
    expect(report.bySlot.length).toBe(1);
    expect(report.byCampaign.length).toBe(1);
    expect(report.byVariant[0]?.id).toBe('variant-b--2026');
    expect(report.kpis.revenue.topVariantId).toBe('variant-b--2026');
    expect(report.kpis.ux.consentAcceptanceRate).toBe(50);

    const exported = exportAdPerformanceReport(30);
    expect(exported).not.toContain('user@example.com');
  });
});
