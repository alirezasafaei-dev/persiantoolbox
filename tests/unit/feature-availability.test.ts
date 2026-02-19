import { afterEach, describe, expect, it } from 'vitest';
import {
  buildDisabledApiBody,
  featurePageMetadata,
  getFeatureHref,
  getFeatureInfo,
  isFeatureEnabled,
} from '@/lib/features/availability';

const envKeys = ['FEATURE_SUPPORT_ENABLED', 'FEATURE_ACCOUNT_ENABLED', 'FEATURE_PLANS_ENABLED'];

afterEach(() => {
  envKeys.forEach((key) => delete process.env[key]);
});

describe('feature availability', () => {
  it('exposes env key and default disabled state', () => {
    const info = getFeatureInfo('plans');
    expect(info.enabled).toBe(false);
    expect(info.envKey).toBe('FEATURE_PLANS_ENABLED');
  });

  it('enables feature via env override', () => {
    process.env['FEATURE_SUPPORT_ENABLED'] = '1';
    expect(isFeatureEnabled('support')).toBe(true);
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
    const href = getFeatureHref('account');
    expect(href).toBe('/support');
  });

  it('returns noindex robots when disabled', () => {
    const meta = featurePageMetadata('plans');
    expect(meta.robots).toMatchObject({ index: false, follow: false });

    process.env['FEATURE_PLANS_ENABLED'] = '1';
    const enabledMeta = featurePageMetadata('plans');
    expect(enabledMeta.robots).toBeUndefined();
  });
});
