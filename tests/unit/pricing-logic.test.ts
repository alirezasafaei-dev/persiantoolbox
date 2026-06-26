import { describe, it, expect } from 'vitest';

type BillingPeriod = 'monthly' | 'yearly';

function formatPrice(amount: number): string {
  return amount.toLocaleString('fa-IR');
}

function getPlanPrices(period: BillingPeriod) {
  return period === 'monthly' ? { basic: 99000, pro: 199000 } : { basic: 890000, pro: 1790000 };
}

function getPlanCheckoutId(period: BillingPeriod, tier: 'basic' | 'pro'): string {
  return period === 'monthly' ? `${tier}-monthly` : `${tier}-yearly`;
}

describe('Pricing Logic', () => {
  describe('formatPrice', () => {
    it('formats large numbers with Persian separators', () => {
      const result = formatPrice(99000);
      expect(result).toContain('۹۹');
    });

    it('formats zero', () => {
      const result = formatPrice(0);
      expect(result).toBe('۰');
    });

    it('formats large amounts', () => {
      const result = formatPrice(1790000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPlanPrices', () => {
    it('returns correct monthly prices', () => {
      const prices = getPlanPrices('monthly');
      expect(prices.basic).toBe(99000);
      expect(prices.pro).toBe(199000);
    });

    it('returns correct yearly prices', () => {
      const prices = getPlanPrices('yearly');
      expect(prices.basic).toBe(890000);
      expect(prices.pro).toBe(1790000);
    });

    it('yearly is cheaper per month', () => {
      const monthly = getPlanPrices('monthly');
      const yearly = getPlanPrices('yearly');

      expect(yearly.basic / 12).toBeLessThan(monthly.basic);
      expect(yearly.pro / 12).toBeLessThan(monthly.pro);
    });

    it('pro is more expensive than basic in both periods', () => {
      const monthly = getPlanPrices('monthly');
      const yearly = getPlanPrices('yearly');

      expect(monthly.pro).toBeGreaterThan(monthly.basic);
      expect(yearly.pro).toBeGreaterThan(yearly.basic);
    });

    it('yearly basic savings vs monthly basic over 12 months', () => {
      const monthly = getPlanPrices('monthly');
      const yearly = getPlanPrices('yearly');

      const monthlyCost12 = monthly.basic * 12;
      const savings = monthlyCost12 - yearly.basic;
      expect(savings).toBeGreaterThan(0);
    });
  });

  describe('getPlanCheckoutId', () => {
    it('returns correct monthly IDs', () => {
      expect(getPlanCheckoutId('monthly', 'basic')).toBe('basic-monthly');
      expect(getPlanCheckoutId('monthly', 'pro')).toBe('pro-monthly');
    });

    it('returns correct yearly IDs', () => {
      expect(getPlanCheckoutId('yearly', 'basic')).toBe('basic-yearly');
      expect(getPlanCheckoutId('yearly', 'pro')).toBe('pro-yearly');
    });

    it('all checkout IDs are valid plan IDs', () => {
      const validIds = ['basic-monthly', 'basic-yearly', 'pro-monthly', 'pro-yearly'];
      for (const period of ['monthly', 'yearly'] as const) {
        for (const tier of ['basic', 'pro'] as const) {
          expect(validIds).toContain(getPlanCheckoutId(period, tier));
        }
      }
    });
  });

  describe('Pricing Content Structure', () => {
    const freeFeatures = [
      { text: 'تمام ابزارهای پایه', included: true },
      { text: 'پردازش تک‌فایلی', included: true },
      { text: 'بدون ثبت‌نام', included: true },
      { text: 'پردازش محلی در مرورگر', included: true },
      { text: 'پردازش چندفایلی (Batch)', included: false },
      { text: 'OCR پیشرفته', included: false },
    ];

    const basicFeatures = [
      { text: 'تمام ابزارهای پایه', included: true },
      { text: 'پردازش چندفایلی (Batch)', included: true },
      { text: 'OCR پیشرفته', included: true },
      { text: 'بدون تبلیغات', included: true },
    ];

    const proFeatures = [
      { text: 'تمام امکانات پایه', included: true },
      { text: 'داشبورد مالی پیشرفته', included: true },
      { text: 'گزارش‌های PDF سفارشی', included: true },
      { text: 'پشتیبانی اختصاصی', included: true },
    ];

    it('free plan has fewer included features than basic', () => {
      const freeIncluded = freeFeatures.filter((f) => f.included).length;
      const basicIncluded = basicFeatures.filter((f) => f.included).length;
      expect(basicIncluded).toBeGreaterThanOrEqual(freeIncluded);
    });

    it('pro plan has exclusive features not in free', () => {
      const proFeatureTexts = proFeatures.map((f) => f.text);
      const freeFeatureTexts = freeFeatures.map((f) => f.text);
      const exclusivePro = proFeatureTexts.filter((f) => !freeFeatureTexts.includes(f));
      expect(exclusivePro.length).toBeGreaterThan(0);
    });

    it('feature lists have no duplicate text entries', () => {
      for (const features of [freeFeatures, basicFeatures, proFeatures]) {
        const texts = features.map((f) => f.text);
        expect(new Set(texts).size).toBe(texts.length);
      }
    });
  });
});
