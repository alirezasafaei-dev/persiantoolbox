import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCsp, buildReportOnlyCsp, buildStrictCsp } from '@/proxy';
import { isPlausiblePilotEnabled } from '@/lib/analytics/plausibleConfig';

describe('GA4 provider CSP boundary', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('admits the selected provider without inline/eval or advertising origins', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_GA4_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST123');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/pa-example.js');
    expect(isPlausiblePilotEnabled()).toBe(false);
    for (const build of [buildCsp, buildReportOnlyCsp, buildStrictCsp]) {
      const csp = build('test');
      expect(csp).toContain("script-src 'self' 'nonce-test' https://www.googletagmanager.com");
      expect(csp).toContain('https://*.google-analytics.com');
      expect(csp).not.toContain('plausible.io');
      expect(csp).not.toMatch(/unsafe-eval|doubleclick|googlesyndication/);
    }
  });
  it('does not admit Google when the ID is invalid', () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-bad<script>');
    expect(buildCsp('test')).not.toContain('google-analytics.com');
  });
});
