import { CREDIT_PLANS, type CreditPlan, type CreditPlanId } from '@/lib/pricing/exportCredits';

export type PlanId = CreditPlanId;

export type SubscriptionPlan = {
  id: PlanId;
  title: string;
  price: number;
  periodDays: number;
  monthlyCredits: number;
  dailyLimit: number;
  tier: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = CREDIT_PLANS.filter(
  (p: CreditPlan) => p.id !== 'free',
).map((p: CreditPlan) => ({
  id: p.id,
  title: p.title,
  price: p.price,
  periodDays: p.periodDays,
  monthlyCredits: p.monthlyCredits,
  dailyLimit: p.dailyLimit,
  tier: p.tier,
}));

export function getPlanById(planId: PlanId): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function getUpgradePlanId(planId: PlanId): PlanId | null {
  const map: Partial<Record<PlanId, PlanId>> = {
    'pack-3': 'basic',
    basic: 'standard',
    standard: 'pro',
    pro: 'team',
  };
  return map[planId] ?? null;
}
