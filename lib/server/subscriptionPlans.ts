import type { CreditPlan } from '@/lib/pricing/exportCredits';
import { getResolvedPricing } from '@/lib/server/pricingStorage';
import type { PlanId, SubscriptionPlan } from '@/lib/subscriptionPlans';

function toSubscriptionPlan(plan: CreditPlan): SubscriptionPlan {
  return {
    id: plan.id,
    title: plan.title,
    price: plan.price,
    periodDays: plan.periodDays,
    monthlyCredits: plan.monthlyCredits,
    dailyLimit: plan.dailyLimit,
    tier: plan.tier,
  };
}

export async function getPlanByIdAsync(planId: PlanId): Promise<SubscriptionPlan | undefined> {
  const pricing = await getResolvedPricing();
  const plan = pricing.plans.find((entry) => entry.id === planId);
  return plan ? toSubscriptionPlan(plan) : undefined;
}

export async function getSubscriptionPlansAsync(): Promise<SubscriptionPlan[]> {
  const pricing = await getResolvedPricing();
  return pricing.plans.filter((plan) => plan.id !== 'free').map((plan) => toSubscriptionPlan(plan));
}
