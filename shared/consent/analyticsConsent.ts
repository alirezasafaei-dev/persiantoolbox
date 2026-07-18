export type AnalyticsConsentState = {
  ad_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
  analytics_storage: boolean;
  version: 'v2';
};

export const ANALYTICS_CONSENT_KEY = 'pt-consent';
export const ANALYTICS_CONSENT_EVENT = 'pt:analytics-consent';

export function readAnalyticsConsent(): AnalyticsConsentState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AnalyticsConsentState>;
    if (parsed.version !== 'v2') {
      return null;
    }
    return {
      ad_storage: parsed.ad_storage === true,
      ad_user_data: parsed.ad_user_data === true,
      ad_personalization: parsed.ad_personalization === true,
      analytics_storage: parsed.analytics_storage === true,
      version: 'v2',
    };
  } catch {
    return null;
  }
}

export function writeAnalyticsConsent(state: AnalyticsConsentState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(state));
  } catch {
    // Consent still applies to this page even when localStorage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<AnalyticsConsentState>(ANALYTICS_CONSENT_EVENT, { detail: state }),
  );
}
