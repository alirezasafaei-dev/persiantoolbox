import { describe, it, expect } from 'vitest';
import {
  SUBSCRIPTION_PLANS,
  getPlanById,
  getUpgradePlanId,
  type PlanId,
} from '@/lib/subscriptionPlans';

describe('Subscription Plans', () => {
  it('should map pack-3 to basic', () => {
    expect(getUpgradePlanId('pack-3')).toBe('basic');
  });

  it('should map basic to standard', () => {
    expect(getUpgradePlanId('basic')).toBe('standard');
  });

  it('should map standard to pro', () => {
    expect(getUpgradePlanId('standard')).toBe('pro');
  });

  it('should map pro to team', () => {
    expect(getUpgradePlanId('pro')).toBe('team');
  });

  it('should return null for team (highest tier)', () => {
    expect(getUpgradePlanId('team')).toBeNull();
  });

  it('should have 5 plans defined (pack-3, basic, standard, pro, team)', () => {
    expect(SUBSCRIPTION_PLANS).toHaveLength(5);
  });

  it('each plan has required fields', () => {
    for (const plan of SUBSCRIPTION_PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.title).toBeTruthy();
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.periodDays).toBeGreaterThan(0);
      expect(plan.monthlyCredits).toBeGreaterThan(0);
      expect(plan.dailyLimit).toBeGreaterThan(0);
      expect(plan.tier).toBeTruthy();
    }
  });

  it('getPlanById returns correct plan', () => {
    const plan = getPlanById('basic');
    expect(plan).toBeDefined();
    expect(plan?.price).toBe(99000);
    expect(plan?.tier).toBe('basic');
    expect(plan?.periodDays).toBe(30);
  });

  it('getPlanById returns undefined for invalid id', () => {
    const plan = getPlanById('invalid-plan' as PlanId);
    expect(plan).toBeUndefined();
  });

  it('pro plans are more expensive than basic', () => {
    const basic = getPlanById('basic');
    const pro = getPlanById('pro');
    expect(pro?.price).toBeGreaterThan(basic?.price as number);
  });

  it('pack-3 has 30 period days', () => {
    const pack = getPlanById('pack-3');
    expect(pack?.periodDays).toBe(30);
  });

  it('monthly plans have 30 period days', () => {
    const basic = getPlanById('basic');
    const pro = getPlanById('pro');
    expect(basic?.periodDays).toBe(30);
    expect(pro?.periodDays).toBe(30);
  });

  it('higher tiers have more credits', () => {
    const basic = SUBSCRIPTION_PLANS.find((p) => p.tier === 'basic');
    const pro = SUBSCRIPTION_PLANS.find((p) => p.tier === 'pro');
    expect(basic).toBeDefined();
    expect(pro).toBeDefined();
    expect(pro?.monthlyCredits).toBeGreaterThan(basic?.monthlyCredits as number);
  });

  it('all plan IDs are unique', () => {
    const ids = SUBSCRIPTION_PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
