import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_EVENTS } from '@/shared/analytics/events';
import {
  buildPlausiblePageUrl,
  sanitizePlausibleProperties,
  trackPlausibleEvent,
} from '@/shared/analytics/plausible';
import { writeAnalyticsConsent } from '@/shared/consent/analyticsConsent';

describe('Plausible privacy contract', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/pa-example.js');
    window.localStorage.clear();
    window.plausible = vi.fn();
  });

  afterEach(() => {
    window.localStorage.clear();
    delete window.plausible;
    vi.unstubAllEnvs();
  });

  it('does not emit without analytics consent', () => {
    trackPlausibleEvent(ANALYTICS_EVENTS.TOOL_RUN, { tool_id: 'address-fa-to-en' });

    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('keeps attribution parameters and removes sensitive query parameters', () => {
    const result = new URL(
      buildPlausiblePageUrl(
        '/text-tools/address-fa-to-en',
        'https://persiantoolbox.ir/source?utm_source=medium&address=private&token=secret',
      ),
    );

    expect(result.pathname).toBe('/text-tools/address-fa-to-en');
    expect(result.searchParams.get('utm_source')).toBe('medium');
    expect(result.searchParams.has('address')).toBe(false);
    expect(result.searchParams.has('token')).toBe(false);
  });

  it('maps an approved event after consent', () => {
    writeAnalyticsConsent({
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: true,
      version: 'v2',
    });

    trackPlausibleEvent(ANALYTICS_EVENTS.TOOL_RUN, {
      tool_id: 'address-fa-to-en',
      category: 'text-tools',
    });

    expect(window.plausible).toHaveBeenCalledWith('Tool Start', {
      props: { tool_id: 'address-fa-to-en', category: 'text-tools' },
    });
  });

  it('drops arbitrary, sensitive, numeric, and unsafe property values', () => {
    expect(
      sanitizePlausibleProperties({
        tool_id: 'address-fa-to-en',
        source: '/text-tools/address-fa-to-en',
        address: 'تهران، خیابان آزادی',
        salary: 120_000_000,
        documentContent: 'private text',
        fileName: 'passport.pdf',
        product: 'resume builder with spaces',
      }),
    ).toEqual({
      tool_id: 'address-fa-to-en',
      source: '/text-tools/address-fa-to-en',
    });
  });

  it('does not forward events outside the pilot map', () => {
    writeAnalyticsConsent({
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: true,
      version: 'v2',
    });

    trackPlausibleEvent(ANALYTICS_EVENTS.SEARCH_SUBMIT, { source: '/tools' });

    expect(window.plausible).not.toHaveBeenCalled();
  });
});
