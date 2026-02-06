export type PlanId = 'basic_monthly' | 'basic_yearly' | 'pro_monthly' | 'pro_yearly';

export type SubscriptionPlan = {
  id: PlanId;
  title: string;
  price: number;
  periodDays: number;
  retentionDays: number;
  storageMb: number;
  tier: 'basic' | 'pro';
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic_monthly',
    title: 'پلن پایه ماهانه',
    price: 49000,
    periodDays: 30,
    retentionDays: 30,
    storageMb: 500,
    tier: 'basic',
  },
  {
    id: 'basic_yearly',
    title: 'پلن پایه سالانه',
    price: 490000,
    periodDays: 365,
    retentionDays: 30,
    storageMb: 500,
    tier: 'basic',
  },
  {
    id: 'pro_monthly',
    title: 'پلن حرفه‌ای ماهانه',
    price: 99000,
    periodDays: 30,
    retentionDays: 9999,
    storageMb: 5120,
    tier: 'pro',
  },
  {
    id: 'pro_yearly',
    title: 'پلن حرفه‌ای سالانه',
    price: 990000,
    periodDays: 365,
    retentionDays: 9999,
    storageMb: 5120,
    tier: 'pro',
  },
];

export function getPlanById(planId: PlanId): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function getUpgradePlanId(planId: PlanId): PlanId | null {
  const map: Partial<Record<PlanId, PlanId>> = {
    basic_monthly: 'pro_monthly',
    basic_yearly: 'pro_yearly',
  };
  return map[planId] ?? null;
}
