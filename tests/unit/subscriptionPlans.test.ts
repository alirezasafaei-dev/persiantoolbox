import { describe, it, expect } from 'vitest';
import { getUpgradePlanId } from '@/lib/subscriptionPlans';

describe('Subscription Plans', () => {
  it('should map basic monthly to pro monthly', () => {
    expect(getUpgradePlanId('basic-monthly')).toBe('pro-monthly');
  });

  it('should map basic yearly to pro yearly', () => {
    expect(getUpgradePlanId('basic-yearly')).toBe('pro-yearly');
  });

  it('should return null for pro plans', () => {
    expect(getUpgradePlanId('pro-monthly')).toBeNull();
    expect(getUpgradePlanId('pro-yearly')).toBeNull();
  });
});
