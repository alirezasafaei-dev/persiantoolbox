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
});
