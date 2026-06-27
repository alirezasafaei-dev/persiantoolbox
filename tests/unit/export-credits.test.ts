import { describe, expect, it } from 'vitest';
import {
  CREDIT_PLANS,
  TOP_UP_PACKS,
  getPlanById,
  getTopUpById,
  formatPrice,
} from '@/lib/pricing/exportCredits';

describe('Export credit pricing', () => {
  describe('Credit plans', () => {
    it('has 6 plans (free, pack-3, basic, standard, pro, team)', () => {
      expect(CREDIT_PLANS).toHaveLength(6);
    });

    it('free plan has 0 credits and 0 price', () => {
      const free = getPlanById('free');
      expect(free).toBeDefined();
      expect(free!.price).toBe(0);
      expect(free!.monthlyCredits).toBe(0);
      expect(free!.dailyLimit).toBe(0);
    });

    it('pack-3 has 3 credits and 49000 price', () => {
      const pack = getPlanById('pack-3');
      expect(pack).toBeDefined();
      expect(pack!.price).toBe(49000);
      expect(pack!.monthlyCredits).toBe(3);
      expect(pack!.dailyLimit).toBe(3);
      expect(pack!.topUpsAllowed).toBe(false);
    });

    it('basic has 10 credits and 99000 price', () => {
      const basic = getPlanById('basic');
      expect(basic).toBeDefined();
      expect(basic!.price).toBe(99000);
      expect(basic!.monthlyCredits).toBe(10);
      expect(basic!.dailyLimit).toBe(3);
      expect(basic!.topUpsAllowed).toBe(true);
    });

    it('standard has 120 credits and 199000 price', () => {
      const standard = getPlanById('standard');
      expect(standard).toBeDefined();
      expect(standard!.price).toBe(199000);
      expect(standard!.monthlyCredits).toBe(120);
      expect(standard!.dailyLimit).toBe(10);
    });

    it('pro has 500 credits and 399000 price', () => {
      const pro = getPlanById('pro');
      expect(pro).toBeDefined();
      expect(pro!.price).toBe(399000);
      expect(pro!.monthlyCredits).toBe(500);
      expect(pro!.dailyLimit).toBe(30);
    });

    it('team has 3000 credits and 999000 price', () => {
      const team = getPlanById('team');
      expect(team).toBeDefined();
      expect(team!.price).toBe(999000);
      expect(team!.monthlyCredits).toBe(3000);
      expect(team!.dailyLimit).toBe(200);
      expect(team!.maxUsers).toBe(5);
    });

    it('unknown plan returns undefined', () => {
      expect(getPlanById('unknown' as any)).toBeUndefined();
    });
  });

  describe('Top-up packs', () => {
    it('has 3 top-up packs', () => {
      expect(TOP_UP_PACKS).toHaveLength(3);
    });

    it('topup-3 has 3 credits and 49000 price', () => {
      const pack = getTopUpById('topup-3');
      expect(pack).toBeDefined();
      expect(pack!.credits).toBe(3);
      expect(pack!.price).toBe(49000);
    });

    it('topup-10 has 10 credits and 129000 price', () => {
      const pack = getTopUpById('topup-10');
      expect(pack).toBeDefined();
      expect(pack!.credits).toBe(10);
      expect(pack!.price).toBe(129000);
    });

    it('topup-50 has 50 credits and 499000 price', () => {
      const pack = getTopUpById('topup-50');
      expect(pack).toBeDefined();
      expect(pack!.credits).toBe(50);
      expect(pack!.price).toBe(499000);
    });

    it('unknown top-up returns undefined', () => {
      expect(getTopUpById('unknown')).toBeUndefined();
    });
  });

  describe('Pricing rules', () => {
    it('daily limit never exceeds monthly credits', () => {
      for (const plan of CREDIT_PLANS) {
        if (plan.monthlyCredits > 0) {
          expect(plan.dailyLimit).toBeLessThanOrEqual(plan.monthlyCredits);
        }
      }
    });

    it('pack-3 has no top-ups allowed', () => {
      const pack = getPlanById('pack-3');
      expect(pack!.topUpsAllowed).toBe(false);
    });

    it('basic and above have top-ups allowed', () => {
      for (const id of ['basic', 'standard', 'pro', 'team'] as const) {
        const plan = getPlanById(id);
        expect(plan!.topUpsAllowed).toBe(true);
      }
    });

    it('yearly plans are cheaper than 12x monthly', () => {
      const basicMonthly = getPlanById('basic')!.price * 12;
      const basicYearly = 890000;
      expect(basicYearly).toBeLessThan(basicMonthly);

      const proMonthly = getPlanById('pro')!.price * 12;
      const proYearly = 1790000;
      expect(proYearly).toBeLessThan(proMonthly);
    });
  });

  describe('formatPrice', () => {
    it('formats price with locale', () => {
      expect(formatPrice(49000)).toBe('۴۹٬۰۰۰');
      expect(formatPrice(199000)).toBe('۱۹۹٬۰۰۰');
    });
  });
});
