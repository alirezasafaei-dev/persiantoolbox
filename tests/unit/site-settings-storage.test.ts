import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SITE_SETTINGS, type PublicSiteSettings } from '@/lib/siteSettings';

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);

function getStoragePath(): string {
  const storagePath = process.env['SITE_SETTINGS_STORAGE_PATH'];
  if (!storagePath) {
    throw new Error('SITE_SETTINGS_STORAGE_PATH is not configured for this test');
  }
  return storagePath;
}

describe('site settings storage', () => {
  let tempDir: string;
  const originalJsonPath = process.env['SITE_SETTINGS_STORAGE_PATH'];
  const originalSqlitePath = process.env['SITE_SETTINGS_SQLITE_PATH'];

  beforeEach(() => {
    vi.resetModules();
    tempDir = mkdtempSync(join(tmpdir(), 'pt-site-settings-'));
    process.env['SITE_SETTINGS_STORAGE_PATH'] = join(tempDir, 'site-settings.json');
    process.env['SITE_SETTINGS_SQLITE_PATH'] = join(tempDir, 'site-settings.sqlite');
  });

  afterEach(() => {
    vi.resetModules();
    if (originalJsonPath === undefined) {
      delete process.env['SITE_SETTINGS_STORAGE_PATH'];
    } else {
      process.env['SITE_SETTINGS_STORAGE_PATH'] = originalJsonPath;
    }
    if (originalSqlitePath === undefined) {
      delete process.env['SITE_SETTINGS_SQLITE_PATH'];
    } else {
      process.env['SITE_SETTINGS_SQLITE_PATH'] = originalSqlitePath;
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('persists admin site settings without touching production storage paths', async () => {
    const { getPublicSiteSettings, updateSiteSettings } = await import('@/lib/server/siteSettings');

    const updated = await updateSiteSettings({
      companyName: 'Persian Toolbox Test',
      telegramUrl: 'https://t.me/persiantoolbox_test',
      orderUrl: '/support',
    });
    const settings = await getPublicSiteSettings();

    expect(updated.companyName).toBe('Persian Toolbox Test');
    expect(settings.companyName).toBe('Persian Toolbox Test');
    expect(settings.telegramUrl).toBe('https://t.me/persiantoolbox_test');
    expect(settings.orderUrl).toBe('/support');

    if (nodeMajor < 22) {
      const raw = readFileSync(getStoragePath(), 'utf-8');
      const json = JSON.parse(raw) as Partial<PublicSiteSettings>;
      expect(json.companyName).toBe('Persian Toolbox Test');
      expect(json.orderUrl).toBe('/support');
    }
  });

  it('falls back to defaults instead of failing on unreadable JSON storage', async () => {
    if (nodeMajor >= 22) {
      return;
    }

    const { writeFileSync } = await import('node:fs');
    writeFileSync(getStoragePath(), '{bad-json', 'utf-8');

    const { getPublicSiteSettings } = await import('@/lib/server/siteSettings');
    const settings = await getPublicSiteSettings();

    expect(settings.companyName).toBe(DEFAULT_SITE_SETTINGS.companyName);
    expect(settings.developerName).toBe(DEFAULT_SITE_SETTINGS.developerName);
  });
});
