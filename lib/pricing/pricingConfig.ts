import {
  CREDIT_PLANS,
  TOP_UP_PACKS,
  formatPrice,
  type CreditPlan,
  type CreditPlanId,
  type TopUpPack,
} from '@/lib/pricing/exportCredits';

export type PlanPriceOverride = {
  price?: number;
  yearlyPrice?: number;
  title?: string;
  enabled?: boolean;
  recommended?: boolean;
};

export type TopUpPriceOverride = {
  price?: number;
  credits?: number;
  label?: string;
  enabled?: boolean;
};

export type PricingOverrides = {
  plans: Partial<Record<CreditPlanId, PlanPriceOverride>>;
  topUps: Partial<Record<string, TopUpPriceOverride>>;
  updatedAt: number | null;
};

export type PublicPricingConfig = {
  plans: CreditPlan[];
  topUps: TopUpPack[];
  yearlyPrices: Partial<Record<CreditPlanId, number>>;
  pack3Price: number;
  pack3PriceFormatted: string;
  updatedAt: number | null;
};

export const DEFAULT_YEARLY_PRICES: Partial<Record<CreditPlanId, number>> = {
  basic: 890_000,
  standard: 1_790_000,
  pro: 3_590_000,
  team: 8_990_000,
};

export const EMPTY_PRICING_OVERRIDES: PricingOverrides = {
  plans: {},
  topUps: {},
  updatedAt: null,
};

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function normalizePlanOverride(value: unknown): PlanPriceOverride | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const input = value as Record<string, unknown>;
  const override: PlanPriceOverride = {};
  if ('price' in input && isPositiveInteger(input['price'])) {
    override.price = input['price'];
  }
  if ('yearlyPrice' in input && isPositiveInteger(input['yearlyPrice'])) {
    override.yearlyPrice = input['yearlyPrice'];
  }
  if ('title' in input && typeof input['title'] === 'string') {
    override.title = input['title'].trim().slice(0, 80);
  }
  if ('enabled' in input && typeof input['enabled'] === 'boolean') {
    override.enabled = input['enabled'];
  }
  if ('recommended' in input && typeof input['recommended'] === 'boolean') {
    override.recommended = input['recommended'];
  }
  return Object.keys(override).length > 0 ? override : null;
}

function normalizeTopUpOverride(value: unknown): TopUpPriceOverride | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const input = value as Record<string, unknown>;
  const override: TopUpPriceOverride = {};
  if ('price' in input && isPositiveInteger(input['price'])) {
    override.price = input['price'];
  }
  if ('credits' in input && isPositiveInteger(input['credits']) && input['credits'] > 0) {
    override.credits = input['credits'];
  }
  if ('label' in input && typeof input['label'] === 'string') {
    override.label = input['label'].trim().slice(0, 80);
  }
  if ('enabled' in input && typeof input['enabled'] === 'boolean') {
    override.enabled = input['enabled'];
  }
  return Object.keys(override).length > 0 ? override : null;
}

export function normalizePricingOverrides(value: unknown): PricingOverrides {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ...EMPTY_PRICING_OVERRIDES };
  }
  const input = value as Record<string, unknown>;
  const plans: PricingOverrides['plans'] = {};
  const topUps: PricingOverrides['topUps'] = {};

  if (isRecord(input['plans'])) {
    for (const [planId, overrideValue] of Object.entries(input['plans'])) {
      if (!CREDIT_PLANS.some((plan) => plan.id === planId)) {
        continue;
      }
      const override = normalizePlanOverride(overrideValue);
      if (override) {
        plans[planId as CreditPlanId] = override;
      }
    }
  }

  if (isRecord(input['topUps'])) {
    for (const [topUpId, overrideValue] of Object.entries(input['topUps'])) {
      if (!TOP_UP_PACKS.some((pack) => pack.id === topUpId)) {
        continue;
      }
      const override = normalizeTopUpOverride(overrideValue);
      if (override) {
        topUps[topUpId] = override;
      }
    }
  }

  const updatedAt =
    typeof input['updatedAt'] === 'number' && Number.isFinite(input['updatedAt'])
      ? input['updatedAt']
      : null;

  return { plans, topUps, updatedAt };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergePricingConfig(overrides: PricingOverrides): PublicPricingConfig {
  const plans = CREDIT_PLANS.map((plan) => {
    const override = overrides.plans[plan.id];
    if (override?.enabled === false) {
      return null;
    }
    return {
      ...plan,
      ...(override?.title ? { title: override.title } : {}),
      ...(override?.price !== undefined ? { price: override.price } : {}),
      ...(override?.recommended !== undefined ? { recommended: override.recommended } : {}),
    };
  }).filter((plan): plan is CreditPlan => plan !== null);

  const topUps = TOP_UP_PACKS.map((pack) => {
    const override = overrides.topUps[pack.id];
    if (override?.enabled === false) {
      return null;
    }
    return {
      ...pack,
      ...(override?.label ? { label: override.label } : {}),
      ...(override?.credits !== undefined ? { credits: override.credits } : {}),
      ...(override?.price !== undefined ? { price: override.price } : {}),
    };
  }).filter((pack): pack is TopUpPack => pack !== null);

  const yearlyPrices: Partial<Record<CreditPlanId, number>> = {};
  for (const planId of ['basic', 'standard', 'pro', 'team'] as CreditPlanId[]) {
    const override = overrides.plans[planId];
    yearlyPrices[planId] =
      override?.yearlyPrice ??
      DEFAULT_YEARLY_PRICES[planId] ??
      plans.find((p) => p.id === planId)!.price * 12;
  }

  const pack3 = plans.find((plan) => plan.id === 'pack-3');
  const pack3Price = pack3?.price ?? 49_000;

  return {
    plans,
    topUps,
    yearlyPrices,
    pack3Price,
    pack3PriceFormatted: formatPrice(pack3Price),
    updatedAt: overrides.updatedAt,
  };
}

export function validatePricingPatch(
  input: unknown,
): { ok: true; value: PricingOverrides } | { ok: false; errors: string[] } {
  if (!isRecord(input)) {
    return { ok: false, errors: ['بدنه درخواست نامعتبر است.'] };
  }

  const errors: string[] = [];
  const plans: PricingOverrides['plans'] = {};
  const topUps: PricingOverrides['topUps'] = {};

  if ('plans' in input) {
    if (!isRecord(input['plans'])) {
      errors.push('فیلد plans باید آبجکت باشد.');
    } else {
      for (const [planId, value] of Object.entries(input['plans'])) {
        if (!CREDIT_PLANS.some((plan) => plan.id === planId)) {
          errors.push(`شناسه پلن نامعتبر: ${planId}`);
          continue;
        }
        if (!isRecord(value)) {
          errors.push(`مقدار پلن ${planId} نامعتبر است.`);
          continue;
        }
        const override: PlanPriceOverride = {};
        if ('price' in value) {
          if (!isPositiveInteger(value['price'])) {
            errors.push(`قیمت پلن ${planId} باید عدد صحیح مثبت باشد.`);
          } else {
            override.price = value['price'];
          }
        }
        if ('yearlyPrice' in value) {
          if (!isPositiveInteger(value['yearlyPrice'])) {
            errors.push(`قیمت سالانه پلن ${planId} باید عدد صحیح مثبت باشد.`);
          } else {
            override.yearlyPrice = value['yearlyPrice'];
          }
        }
        if ('title' in value) {
          if (typeof value['title'] !== 'string') {
            errors.push(`عنوان پلن ${planId} باید رشته باشد.`);
          } else {
            override.title = value['title'].trim().slice(0, 80);
          }
        }
        if ('enabled' in value && typeof value['enabled'] !== 'boolean') {
          errors.push(`وضعیت فعال بودن پلن ${planId} باید boolean باشد.`);
        } else if ('enabled' in value && typeof value['enabled'] === 'boolean') {
          override.enabled = value['enabled'];
        }
        if ('recommended' in value && typeof value['recommended'] !== 'boolean') {
          errors.push(`فیلد recommended پلن ${planId} باید boolean باشد.`);
        } else if ('recommended' in value && typeof value['recommended'] === 'boolean') {
          override.recommended = value['recommended'];
        }
        if (Object.keys(override).length > 0) {
          plans[planId as CreditPlanId] = override;
        }
      }
    }
  }

  if ('topUps' in input) {
    if (!isRecord(input['topUps'])) {
      errors.push('فیلد topUps باید آبجکت باشد.');
    } else {
      for (const [topUpId, value] of Object.entries(input['topUps'])) {
        if (!TOP_UP_PACKS.some((pack) => pack.id === topUpId)) {
          errors.push(`شناسه top-up نامعتبر: ${topUpId}`);
          continue;
        }
        if (!isRecord(value)) {
          errors.push(`مقدار top-up ${topUpId} نامعتبر است.`);
          continue;
        }
        const override: TopUpPriceOverride = {};
        if ('price' in value) {
          if (!isPositiveInteger(value['price'])) {
            errors.push(`قیمت top-up ${topUpId} باید عدد صحیح مثبت باشد.`);
          } else {
            override.price = value['price'];
          }
        }
        if ('credits' in value) {
          if (!isPositiveInteger(value['credits']) || value['credits'] <= 0) {
            errors.push(`تعداد اعتبار top-up ${topUpId} باید عدد مثبت باشد.`);
          } else {
            override.credits = value['credits'];
          }
        }
        if ('label' in value) {
          if (typeof value['label'] !== 'string') {
            errors.push(`برچسب top-up ${topUpId} باید رشته باشد.`);
          } else {
            override.label = value['label'].trim().slice(0, 80);
          }
        }
        if ('enabled' in value && typeof value['enabled'] !== 'boolean') {
          errors.push(`وضعیت فعال بودن top-up ${topUpId} باید boolean باشد.`);
        } else if ('enabled' in value && typeof value['enabled'] === 'boolean') {
          override.enabled = value['enabled'];
        }
        if (Object.keys(override).length > 0) {
          topUps[topUpId] = override;
        }
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      plans,
      topUps,
      updatedAt: Date.now(),
    },
  };
}

export function getYearlyMonthlyEquivalent(yearlyPrice: number): number {
  return Math.round(yearlyPrice / 12);
}

export function formatPack3Snippet(pack3PriceFormatted: string): string {
  return `بسته ۳ خروجی از ${pack3PriceFormatted} تومان`;
}
