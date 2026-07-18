import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from '@/shared/consent/analyticsConsent';

describe('analytics consent storage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('persists normalized v2 consent and notifies same-page consumers', () => {
    const listener = vi.fn();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, listener);

    writeAnalyticsConsent({
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: true,
      version: 'v2',
    });

    expect(readAnalyticsConsent()).toEqual({
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: true,
      version: 'v2',
    });
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, listener);
  });

  it('rejects stale consent versions', () => {
    window.localStorage.setItem('pt-consent', JSON.stringify({ version: 'v1' }));
    expect(readAnalyticsConsent()).toBeNull();
  });
});
