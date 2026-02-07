import { beforeEach, describe, expect, it } from 'vitest';
import { clearAdsConsent, getAdsConsent, updateAdsConsent } from '@/shared/consent/adsConsent';

describe('ads consent storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to disabled consent', () => {
    const consent = getAdsConsent();
    expect(consent.contextualAds).toBe(false);
    expect(consent.targetedAds).toBe(false);
    expect(consent.updatedAt).toBeNull();
  });

  it('keeps targetedAds disabled without contextualAds', () => {
    const consent = updateAdsConsent({ targetedAds: true });
    expect(consent.targetedAds).toBe(false);
    expect(consent.contextualAds).toBe(false);
  });

  it('enables targetedAds only when contextualAds is enabled', () => {
    const consent = updateAdsConsent({ contextualAds: true, targetedAds: true });
    expect(consent.targetedAds).toBe(true);
    expect(consent.contextualAds).toBe(true);
  });

  it('clears targetedAds when contextualAds is false', () => {
    const consent = updateAdsConsent({ contextualAds: true, targetedAds: true });
    expect(consent.contextualAds).toBe(true);
    expect(consent.targetedAds).toBe(true);
    const downgraded = updateAdsConsent({ contextualAds: false });
    expect(downgraded.contextualAds).toBe(false);
    expect(downgraded.targetedAds).toBe(false);
  });

  it('clears stored consent', () => {
    updateAdsConsent({ contextualAds: true });
    const cleared = clearAdsConsent();
    expect(cleared.contextualAds).toBe(false);
    expect(getAdsConsent().contextualAds).toBe(false);
  });
});
