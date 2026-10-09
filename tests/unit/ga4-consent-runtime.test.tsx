import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { writeAnalyticsConsent } from '@/shared/consent/analyticsConsent';

let pathname = '/tools';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
vi.mock('next/script', () => ({
  default: (props: { src: string; nonce?: string }) => (
    <span data-testid="ga-loader" data-src={props.src} data-nonce={props.nonce} />
  ),
}));
const setConsent = (allowed: boolean) =>
  writeAnalyticsConsent({
    version: 'v2',
    analytics_storage: allowed,
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
  });

describe('GA4 basic consent privacy', () => {
  beforeEach(() => {
    pathname = '/tools';
    vi.stubEnv('NEXT_PUBLIC_GA4_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST123');
    localStorage.clear();
    delete window.gtag;
    delete window.dataLayer;
  });
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllEnvs();
  });
  it('does not load or initialize before consent or after rejection', () => {
    render(<GoogleAnalytics nonce="test" />);
    expect(screen.queryByTestId('ga-loader')).toBeNull();
    act(() => setConsent(false));
    expect(window.gtag).toBeUndefined();
    expect(screen.queryByTestId('ga-loader')).toBeNull();
  });
  it('loads only after analytics consent with nonce and denies advertising', () => {
    render(<GoogleAnalytics nonce="test" />);
    act(() => setConsent(true));
    expect(screen.getByTestId('ga-loader').getAttribute('data-nonce')).toBe('test');
    const commands = window.dataLayer?.map((value) => Array.from(value as ArrayLike<unknown>));
    expect(commands).toContainEqual([
      'consent',
      'default',
      expect.objectContaining({
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      }),
    ]);
    expect(commands).toContainEqual([
      'config',
      'G-TEST123',
      expect.objectContaining({ send_page_view: false }),
    ]);
  });
  it('stops collection after revocation and does not emit private routes', () => {
    setConsent(true);
    const { rerender } = render(<GoogleAnalytics nonce="test" />);
    act(() => setConsent(false));
    expect(window['ga-disable-G-TEST123']).toBe(true);
    pathname = '/account';
    rerender(<GoogleAnalytics nonce="test" />);
    expect(screen.queryByTestId('ga-loader')).toBeNull();
    const commands = window.dataLayer?.map((value) => Array.from(value as ArrayLike<unknown>));
    expect(commands?.filter((row) => row[0] === 'event')).toHaveLength(0);
    expect(commands).toContainEqual([
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'denied' }),
    ]);
  });
  it('does not initialize when consent exists but the route is private', () => {
    setConsent(true);
    pathname = '/admin/google-search-console';
    render(<GoogleAnalytics nonce="test" />);
    expect(window.gtag).toBeUndefined();
    expect(screen.queryByTestId('ga-loader')).toBeNull();
  });
  it('does not initialize on financial outcome pages', () => {
    setConsent(true);
    pathname = '/payments/success';
    render(<GoogleAnalytics nonce="test" />);
    expect(window.gtag).toBeUndefined();
    expect(screen.queryByTestId('ga-loader')).toBeNull();
  });
  it('records a public return after visiting a private route without recording the private visit', () => {
    setConsent(true);
    const { rerender } = render(<GoogleAnalytics nonce="test" />);
    pathname = '/account';
    rerender(<GoogleAnalytics nonce="test" />);
    pathname = '/tools';
    rerender(<GoogleAnalytics nonce="test" />);
    const events = window.dataLayer
      ?.map((value) => Array.from(value as ArrayLike<unknown>))
      .filter((row) => row[0] === 'event');
    expect(events).toHaveLength(2);
    expect(JSON.stringify(events)).not.toContain('/account');
  });
  it('updates Google consent and suppresses queued events on cross-tab revocation', () => {
    setConsent(true);
    render(<GoogleAnalytics nonce="test" />);
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    const commands = window.dataLayer?.map((value) => Array.from(value as ArrayLike<unknown>));
    expect(commands).toContainEqual([
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'denied' }),
    ]);
    const count = window.dataLayer?.length;
    window.gtag?.('event', 'private-event');
    expect(window.dataLayer?.length).toBe(count);
    expect(commands?.filter((row) => row[0] === 'event')).toHaveLength(0);
  });
  it('sends only the pathname and referrer origin, excluding query, fragment and page title', () => {
    window.history.replaceState({}, '', '/tools?email=private@example.com#secret');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue(
      'https://chatgpt.com/c/private-chat?text=secret',
    );
    setConsent(true);
    render(<GoogleAnalytics nonce="test" />);
    const commands = window.dataLayer?.map((value) => Array.from(value as ArrayLike<unknown>));
    expect(commands).toContainEqual([
      'event',
      'page_view',
      expect.objectContaining({
        page_location: `${window.location.origin}/tools`,
        page_referrer: 'https://chatgpt.com',
        page_title: '',
      }),
    ]);
    expect(JSON.stringify(commands)).not.toMatch(/private@example|private-chat|text=secret/);
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });
});
