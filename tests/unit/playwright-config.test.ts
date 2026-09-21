import { describe, expect, it } from 'vitest';
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
});
