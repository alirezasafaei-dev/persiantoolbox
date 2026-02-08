import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_SETTINGS,
  mergeSiteSettings,
  normalizeOptionalUrl,
  validateSiteSettingsPatch,
} from '@/lib/siteSettings';

describe('site settings validation', () => {
  it('accepts http/https urls and internal paths', () => {
    expect(normalizeOptionalUrl('https://example.com')).toBe('https://example.com/');
    expect(normalizeOptionalUrl('http://example.com/path')).toBe('http://example.com/path');
    expect(normalizeOptionalUrl('/support')).toBe('/support');
  });

  it('rejects unsupported protocols', () => {
    expect(normalizeOptionalUrl('data:text/plain,hello')).toBeNull();
    expect(normalizeOptionalUrl('ftp://example.com')).toBeNull();
  });

  it('merges partial values with defaults', () => {
    const merged = mergeSiteSettings({
      developerName: 'توسعه‌دهنده تست',
      orderUrl: '/support',
      portfolioUrl: null,
    });

    expect(merged.developerName).toBe('توسعه‌دهنده تست');
    expect(merged.developerBrandText).toBe(DEFAULT_SITE_SETTINGS.developerBrandText);
    expect(merged.orderUrl).toBe('/support');
    expect(merged.portfolioUrl).toBeNull();
  });

  it('validates patch payload', () => {
    const valid = validateSiteSettingsPatch({
      developerName: 'علیرضا صفایی',
      orderUrl: 'https://example.com/order',
      portfolioUrl: null,
    });
    expect(valid.ok).toBe(true);

    const invalid = validateSiteSettingsPatch({
      orderUrl: 'data:text/plain,hello',
    });
    expect(invalid.ok).toBe(false);
  });
});
