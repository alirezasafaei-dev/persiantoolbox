import { describe, it, expect } from 'vitest';
import { getUpgradePlanId } from '@/lib/subscriptionPlans';

describe('Subscription Plans', () => {
  it('should map basic monthly to pro monthly', () => {
    expect(getUpgradePlanId('basic_monthly')).toBe('pro_monthly');
  });

  it('should map basic yearly to pro yearly', () => {
    expect(getUpgradePlanId('basic_yearly')).toBe('pro_yearly');
  });

  it('should return null for pro plans', () => {
    expect(getUpgradePlanId('pro_monthly')).toBeNull();
    expect(getUpgradePlanId('pro_yearly')).toBeNull();
  });
});
