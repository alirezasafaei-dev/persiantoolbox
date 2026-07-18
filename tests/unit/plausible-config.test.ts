import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getPlausibleOrigin,
  getPlausibleScriptUrl,
  isPlausiblePilotEnabled,
} from '@/lib/analytics/plausibleConfig';
import { buildCsp } from '@/proxy';

describe('Plausible pilot configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is disabled by default and does not relax CSP', () => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', '0');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', '');

    expect(isPlausiblePilotEnabled()).toBe(false);
    expect(getPlausibleScriptUrl()).toBeNull();
    expect(buildCsp('nonce')).not.toContain('plausible.io');
  });

  it('accepts only the official HTTPS script path and scopes CSP to its origin', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/pa-example.js');

    expect(isPlausiblePilotEnabled()).toBe(true);
    expect(getPlausibleOrigin()).toBe('https://plausible.io');
    expect(buildCsp('nonce')).toContain("script-src 'self' 'nonce-nonce' https://plausible.io");
    expect(buildCsp('nonce')).toContain(
      "connect-src 'self' https://o4511624450670592.ingest.de.sentry.io https://plausible.io",
    );
  });

  it.each([
    'http://plausible.io/js/pa-example.js',
    'https://evil.example/js/pa-example.js',
    'https://plausible.io/api/event',
    'https://user:pass@plausible.io/js/pa-example.js',
    'https://plausible.io/js/pa-example.js?token=secret',
  ])('rejects unsafe script URL %s', (url) => {
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', '1');
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', url);

    expect(getPlausibleScriptUrl()).toBeNull();
    expect(isPlausiblePilotEnabled()).toBe(false);
  });
});
