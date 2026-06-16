/**
 * Premium Features Manager - PersianToolbox
 *
 * Manages premium tool access and feature gating
 */

import {agentLogger} from '@/lib/agent-logger';

export type PremiumTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface PremiumFeature {
  id: string;
  name: string;
  namePersian: string;
  description: string;
  tier: PremiumTier;
  tools: string[];
  limits: {
    dailyUsage: number;
    exportFormats: string[];
    priority: boolean;
    adsRemoved: boolean;
  };
}

export interface UserSubscription {
  userId: string;
  tier: PremiumTier;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

const premiumTiers: Record<PremiumTier, PremiumFeature> = {
  free: {
    id: 'free',
    name: 'Free',
    namePersian: 'رایگان',
    description: 'دسترسی پایه به ابزارها',
    tier: 'free',
    tools: ['loan', 'salary', 'currency', 'date-converter'],
    limits: {
      dailyUsage: 10,
      exportFormats: ['text'],
      priority: false,
      adsRemoved: false,
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    namePersian: 'پایه',
    description: 'دسترسی بیشتر به ابزارها',
    tier: 'basic',
    tools: [
      'loan', 'salary', 'currency', 'date-converter',
      'pdf-merge', 'pdf-split', 'pdf-compress',
      'image-compress', 'image-format',
    ],
    limits: {
      dailyUsage: 50,
      exportFormats: ['text', 'pdf', 'image'],
      priority: false,
      adsRemoved: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    namePersian: 'حرفه‌ای',
    description: 'دسترسی کامل به تمام ابزارها',
    tier: 'pro',
    tools: [
      'loan', 'salary', 'currency', 'date-converter',
      'pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-to-excel',
      'pdf-page-numbers', 'pdf-header-footer', 'pdf-crop', 'pdf-flatten',
      'image-compress', 'image-format', 'image-bg-remove',
      'inflation', 'investment', 'interest',
    ],
    limits: {
      dailyUsage: -1,
      exportFormats: ['text', 'pdf', 'image', 'excel', 'json'],
      priority: true,
      adsRemoved: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    namePersian: 'سازمانی',
    description: 'دسترسی سازمانی با API',
    tier: 'enterprise',
    tools: ['*'],
    limits: {
      dailyUsage: -1,
      exportFormats: ['text', 'pdf', 'image', 'excel', 'json', 'api'],
      priority: true,
      adsRemoved: true,
    },
  },
};

const userSubscriptions = new Map<string, UserSubscription>();
const usageTracker = new Map<string, {date: string; count: number}>();

export function getPremiumFeature(tier: PremiumTier): PremiumFeature {
  return premiumTiers[tier];
}

export function getAllPremiumTiers(): PremiumFeature[] {
  return Object.values(premiumTiers);
}

export function checkToolAccess(userId: string, toolId: string): boolean {
  const subscription = userSubscriptions.get(userId);
  const tier = subscription?.tier ?? 'free';
  const feature = premiumTiers[tier];

  if (feature.tools.includes('*')) {
    return true;
  }

  return feature.tools.includes(toolId);
}

export function checkDailyLimit(userId: string): {allowed: boolean; remaining: number} {
  const subscription = userSubscriptions.get(userId);
  const tier = subscription?.tier ?? 'free';
  const feature = premiumTiers[tier];

  if (feature.limits.dailyUsage === -1) {
    return {allowed: true, remaining: -1};
  }

  const today = new Date().toISOString().split('T')[0] ?? '';
  const usage = usageTracker.get(userId);

  if (!usage || usage.date !== today) {
    usageTracker.set(userId, {date: today, count: 1});
    return {allowed: true, remaining: feature.limits.dailyUsage - 1};
  }

  if (usage.count >= feature.limits.dailyUsage) {
    return {allowed: false, remaining: 0};
  }

  usage.count++;
  return {allowed: true, remaining: feature.limits.dailyUsage - usage.count};
}

export function recordUsage(userId: string): void {
  const today = new Date().toISOString().split('T')[0] ?? '';
  const usage = usageTracker.get(userId);

  if (!usage || usage.date !== today) {
    usageTracker.set(userId, {date: today, count: 1});
  } else {
    usage.count++;
  }
}

export function setUserSubscription(subscription: UserSubscription): void {
  userSubscriptions.set(subscription.userId, subscription);
  agentLogger.info('premium', 'set-subscription', `Subscription set for ${subscription.userId}`, {
    tier: subscription.tier,
  });
}

export function getUserSubscription(userId: string): UserSubscription | undefined {
  return userSubscriptions.get(userId);
}

export function getUpgradePrice(currentTier: PremiumTier, targetTier: PremiumTier): number {
  const prices: Record<PremiumTier, number> = {
    free: 0,
    basic: 99000,
    pro: 199000,
    enterprise: 499000,
  };

  return prices[targetTier] - prices[currentTier];
}
