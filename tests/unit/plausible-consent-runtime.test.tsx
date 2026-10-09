import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlausibleAnalytics from '@/components/analytics/PlausibleAnalytics';
import {
  writeAnalyticsConsent,
  type AnalyticsConsentState,
} from '@/shared/consent/analyticsConsent';

vi.mock('next/navigation', () => ({ usePathname: () => '/tools' }));
vi.mock('next/script', () => ({
  default: ({ src }: { src: string }) => <span data-testid="analytics-loader" data-src={src} />,
}));

const consent = (allowed: boolean): AnalyticsConsentState => ({
  version: 'v2',
  analytics_storage: allowed,
  ad_storage: false,
  ad_user_data: false,
  ad_personalization: false,
});

describe('supported analytics runtime preserves consent', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/pa-example.js');
    window.localStorage.clear();
    delete window.plausible;
  });
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    delete window.plausible;
    vi.unstubAllEnvs();
  });

  it('loads nothing before consent or after rejection', () => {
    render(<PlausibleAnalytics />);
    expect(screen.queryByTestId('analytics-loader')).toBeNull();
    expect(window.plausible).toBeUndefined();
    act(() => writeAnalyticsConsent(consent(false)));
    expect(screen.queryByTestId('analytics-loader')).toBeNull();
    expect(window.plausible).toBeUndefined();
  });

  it('starts the existing provider only after analytics consent without requiring ad consent', () => {
    render(<PlausibleAnalytics />);
    act(() => writeAnalyticsConsent(consent(true)));
    expect(screen.getByTestId('analytics-loader').getAttribute('data-src')).toBe(
      'https://plausible.io/js/pa-example.js',
    );
    expect(window.plausible?.q?.some((args) => args[0] === 'pageview')).toBe(true);
    expect(window.plausible?.o).toMatchObject({ autoCapturePageviews: false });
  });

  it('honors existing consent and removes the loader after revocation', () => {
    writeAnalyticsConsent(consent(true));
    render(<PlausibleAnalytics />);
    expect(screen.getByTestId('analytics-loader')).toBeTruthy();
    const previousQueueLength = window.plausible?.q?.length;
    act(() => writeAnalyticsConsent(consent(false)));
    expect(screen.queryByTestId('analytics-loader')).toBeNull();
    expect(window.plausible?.q?.length).toBe(previousQueueLength);
  });
});
