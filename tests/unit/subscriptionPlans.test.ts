import { describe, it, expect } from 'vitest';
import {
  SUBSCRIPTION_PLANS,
  getPlanById,
  getUpgradePlanId,
  type PlanId,
} from '@/lib/subscriptionPlans';

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

  it('should have exactly 4 plans defined', () => {
    expect(SUBSCRIPTION_PLANS).toHaveLength(4);
  });

  it('each plan has required fields', () => {
    for (const plan of SUBSCRIPTION_PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.title).toBeTruthy();
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.periodDays).toBeGreaterThan(0);
      expect(['basic', 'pro']).toContain(plan.tier);
    }
  });

  it('getPlanById returns correct plan', () => {
    const plan = getPlanById('basic-monthly');
    expect(plan).toBeDefined();
    expect(plan?.price).toBe(99000);
    expect(plan?.tier).toBe('basic');
    expect(plan?.periodDays).toBe(30);
  });

  it('getPlanById returns undefined for invalid id', () => {
    const plan = getPlanById('invalid-plan' as PlanId);
    expect(plan).toBeUndefined();
  });

  it('yearly plans are cheaper per month than monthly', () => {
    const basicMonthly = getPlanById('basic-monthly');
    const basicYearly = getPlanById('basic-yearly');
    const proMonthly = getPlanById('pro-monthly');
    const proYearly = getPlanById('pro-yearly');

    expect(basicMonthly).toBeDefined();
    expect(basicYearly).toBeDefined();
    expect(proMonthly).toBeDefined();
    expect(proYearly).toBeDefined();

    const basicMonthlyPerMonth = basicMonthly!.price;
    const basicYearlyPerMonth = basicYearly!.price / 12;
    expect(basicYearlyPerMonth).toBeLessThan(basicMonthlyPerMonth);

    const proMonthlyPerMonth = proMonthly!.price;
    const proYearlyPerMonth = proYearly!.price / 12;
    expect(proYearlyPerMonth).toBeLessThan(proMonthlyPerMonth);
  });

  it('pro plans are more expensive than basic', () => {
    const basicMonthly = getPlanById('basic-monthly');
    const proMonthly = getPlanById('pro-monthly');
    expect(proMonthly!.price).toBeGreaterThan(basicMonthly!.price);
  });

  it('yearly plans have 365 period days', () => {
    const basicYearly = getPlanById('basic-yearly');
    const proYearly = getPlanById('pro-yearly');
    expect(basicYearly?.periodDays).toBe(365);
    expect(proYearly?.periodDays).toBe(365);
  });

  it('monthly plans have 30 period days', () => {
    const basicMonthly = getPlanById('basic-monthly');
    const proMonthly = getPlanById('pro-monthly');
    expect(basicMonthly?.periodDays).toBe(30);
    expect(proMonthly?.periodDays).toBe(30);
  });

  it('pro tier has higher storage than basic', () => {
    const basic = SUBSCRIPTION_PLANS.filter((p) => p.tier === 'basic');
    const pro = SUBSCRIPTION_PLANS.filter((p) => p.tier === 'pro');

    for (const b of basic) {
      for (const p of pro) {
        expect(p.storageMb).toBeGreaterThanOrEqual(b.storageMb);
      }
    }
  });

  it('all plan IDs are unique', () => {
    const ids = SUBSCRIPTION_PLANS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
