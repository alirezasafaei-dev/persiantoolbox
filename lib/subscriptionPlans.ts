export type PlanId = 'basic-monthly' | 'basic-yearly' | 'pro-monthly' | 'pro-yearly';

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
    id: 'basic-monthly',
    title: 'پلن پایه ماهانه',
    price: 99000,
    periodDays: 30,
    retentionDays: 30,
    storageMb: 500,
    tier: 'basic',
  },
  {
    id: 'basic-yearly',
    title: 'پلن پایه سالانه',
    price: 890000,
    periodDays: 365,
    retentionDays: 30,
    storageMb: 500,
    tier: 'basic',
  },
  {
    id: 'pro-monthly',
    title: 'پلن حرفه‌ای ماهانه',
    price: 199000,
    periodDays: 30,
    retentionDays: 9999,
    storageMb: 5120,
    tier: 'pro',
  },
  {
    id: 'pro-yearly',
    title: 'پلن حرفه‌ای سالانه',
    price: 1790000,
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
    'basic-monthly': 'pro-monthly',
    'basic-yearly': 'pro-yearly',
  };
  return map[planId] ?? null;
}
