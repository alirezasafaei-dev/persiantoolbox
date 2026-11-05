import { describe, expect, it, vi } from 'vitest';
import config from '../../playwright.config';

describe('Playwright web server configuration', () => {
  it('passes development test variables through cross-platform webServer env', () => {
    const webServer = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;

    expect(webServer).toBeDefined();
    expect(webServer?.command).not.toMatch(/^ADMIN_EMAIL_ALLOWLIST=/);
    expect(webServer?.env).toMatchObject({
      ADMIN_EMAIL_ALLOWLIST: 'admin-e2e@persian-tools.local',
      NEXT_PUBLIC_ANALYTICS_ID: 'playwright-e2e',
    });
  });

  it('launches canonical standalone output in production mode', async () => {
    vi.stubEnv('PLAYWRIGHT_PRODUCTION', '1');
    vi.resetModules();
    try {
      const { default: productionConfig } = await import('../../playwright.config');
      const server = Array.isArray(productionConfig.webServer)
        ? productionConfig.webServer[0]
        : productionConfig.webServer;
      expect(server?.command).toBe('node scripts/quality/start-playwright-standalone.mjs');
      expect(server?.command).not.toMatch(/next\s+start/);
      expect(server?.reuseExistingServer).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
