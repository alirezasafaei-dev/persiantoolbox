import { describe, expect, it } from 'vitest';
import {
  mergePricingConfig,
  normalizePricingOverrides,
  validatePricingPatch,
} from '@/lib/pricing/pricingConfig';
import type { CreditPlanId } from '@/lib/pricing/exportCredits';

describe('pricing config', () => {
  it('merges plan price overrides', () => {
    const config = mergePricingConfig({
      plans: { 'pack-3': { price: 59_000 } },
      topUps: {},
      updatedAt: 1,
    });
    const pack3 = config.plans.find((plan) => plan.id === 'pack-3');
    expect(pack3?.price).toBe(59_000);
    expect(config.pack3Price).toBe(59_000);
    expect(config.pack3PriceFormatted).toBe('۵۹٬۰۰۰');
  });

  it('validates pricing patch', () => {
    const result = validatePricingPatch({
      plans: { basic: { price: 120_000, yearlyPrice: 1_200_000 } },
      topUps: { 'topup-3': { price: 55_000, credits: 3, label: '۳ خروجی' } },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.plans.basic?.price).toBe(120_000);
      expect(result.value.topUps['topup-3']?.price).toBe(55_000);
    }
  });

  it('rejects invalid plan id', () => {
    const result = validatePricingPatch({ plans: { invalid: { price: 100 } } });
    expect(result.ok).toBe(false);
  });

  it('normalizes stored overrides', () => {
    const normalized = normalizePricingOverrides({
      plans: { 'pack-3': { price: 51_000, title: 'بسته ویژه' }, foo: { price: 1 } },
      topUps: { 'topup-3': { price: 50_000 } },
      updatedAt: 99,
    });
    expect(normalized.plans['pack-3']?.price).toBe(51_000);
    expect(normalized.plans['pack-3']?.title).toBe('بسته ویژه');
    expect(normalized.plans['invalid-plan' as CreditPlanId]).toBeUndefined();
    expect(normalized.updatedAt).toBe(99);
  });
});
