import { describe, expect, it, vi } from 'vitest';

describe('brand site url defaults', () => {
  it('uses brand canonical url in production when env is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();
    const { siteUrl } = await import('@/lib/seo');

    expect(siteUrl).toBe('https://persiantoolbox.ir');
    vi.unstubAllEnvs();
  });

  it('throws in production if NEXT_PUBLIC_SITE_URL contains localhost', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    vi.stubEnv('NODE_ENV', 'production');

    vi.resetModules();
    const { getDefaultSiteUrl } = await import('@/lib/brand');

    expect(() => getDefaultSiteUrl()).toThrow(/CRITICAL.*localhost.*production/);
    vi.unstubAllEnvs();
  });

  it('uses localhost fallback in development', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('NODE_ENV', 'development');

    vi.resetModules();
    const { getDefaultSiteUrl } = await import('@/lib/brand');

    expect(getDefaultSiteUrl()).toBe('http://localhost:3000');
    vi.unstubAllEnvs();
  });
});
