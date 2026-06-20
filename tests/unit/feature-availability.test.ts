import { afterEach, describe, expect, it } from 'vitest';
import {
  buildDisabledApiBody,
  featurePageMetadata,
  getFeatureHref,
  getFeatureInfo,
  isFeatureEnabled,
} from '@/lib/features/availability';

const envKeys = [
  'FEATURE_SUPPORT_ENABLED',
  'FEATURE_ACCOUNT_ENABLED',
  'FEATURE_PLANS_ENABLED',
  'FEATURE_ADMIN_SITE_SETTINGS_ENABLED',
];

afterEach(() => {
  envKeys.forEach((key) => delete process.env[key]);
});

describe('feature availability', () => {
  it('exposes env key and default enabled state', () => {
    const info = getFeatureInfo('plans');
    expect(info.enabled).toBe(true);
    expect(info.envKey).toBe('FEATURE_PLANS_ENABLED');
  });

  it('enables feature via env override', () => {
    process.env['FEATURE_SUPPORT_ENABLED'] = '1';
    expect(isFeatureEnabled('support')).toBe(true);
  });

  it('disables feature via env override', () => {
    process.env['FEATURE_PLANS_ENABLED'] = '0';
    expect(isFeatureEnabled('plans')).toBe(false);
  });

  it('builds consistent disabled payload', () => {
    const payload = buildDisabledApiBody('subscription');
    expect(payload).toMatchObject({
      ok: false,
      feature: 'subscription',
      status: 'disabled',
      envKey: 'FEATURE_SUBSCRIPTION_ENABLED',
    });
    expect(payload.message.length).toBeGreaterThan(5);
  });

  it('prefers support fallback href when available', () => {
    process.env['FEATURE_SUPPORT_ENABLED'] = '1';
    process.env['FEATURE_ACCOUNT_ENABLED'] = '0';
    const href = getFeatureHref('account');
    expect(href).toBe('/support');
  });

  it('returns noindex robots when disabled', () => {
    process.env['FEATURE_ADMIN_SITE_SETTINGS_ENABLED'] = '0';
    const meta = featurePageMetadata('admin-site-settings');
    expect(meta.robots).toMatchObject({ index: false, follow: false });

    process.env['FEATURE_ADMIN_SITE_SETTINGS_ENABLED'] = '1';
    const enabledMeta = featurePageMetadata('admin-site-settings');
    expect(enabledMeta.robots).toMatchObject({ index: false, follow: false });
  });

  it('returns noindex robots when feature is disabled by default', () => {
    const meta = featurePageMetadata('subscription');
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});
