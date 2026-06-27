export type CreditPlanId = 'free' | 'pack-3' | 'basic' | 'standard' | 'pro' | 'team';

export type TopUpPack = {
  id: string;
  credits: number;
  price: number;
  label: string;
};

export type CreditPlan = {
  id: CreditPlanId;
  title: string;
  price: number;
  periodDays: number;
  monthlyCredits: number;
  dailyLimit: number;
  maxUsers: number;
  topUpsAllowed: boolean;
  tier: 'free' | 'pack' | 'basic' | 'standard' | 'pro' | 'team';
  recommended?: boolean;
};

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'free',
    title: 'رایگان',
    price: 0,
    periodDays: 0,
    monthlyCredits: 0,
    dailyLimit: 0,
    maxUsers: 1,
    topUpsAllowed: false,
    tier: 'free',
  },
  {
    id: 'pack-3',
    title: 'بسته ۳ خروجی',
    price: 49000,
    periodDays: 30,
    monthlyCredits: 3,
    dailyLimit: 3,
    maxUsers: 1,
    topUpsAllowed: false,
    tier: 'pack',
  },
  {
    id: 'basic',
    title: 'پایه',
    price: 99000,
    periodDays: 30,
    monthlyCredits: 10,
    dailyLimit: 3,
    maxUsers: 1,
    topUpsAllowed: true,
    tier: 'basic',
  },
  {
    id: 'standard',
    title: 'استاندارد',
    price: 199000,
    periodDays: 30,
    monthlyCredits: 120,
    dailyLimit: 10,
    maxUsers: 1,
    topUpsAllowed: true,
    tier: 'standard',
  },
  {
    id: 'pro',
    title: 'حرفه‌ای',
    price: 399000,
    periodDays: 30,
    monthlyCredits: 500,
    dailyLimit: 30,
    maxUsers: 1,
    topUpsAllowed: true,
    tier: 'pro',
  },
  {
    id: 'team',
    title: 'تیم',
    price: 999000,
    periodDays: 30,
    monthlyCredits: 3000,
    dailyLimit: 200,
    maxUsers: 5,
    topUpsAllowed: true,
    tier: 'team',
  },
];

export const TOP_UP_PACKS: TopUpPack[] = [
  { id: 'topup-3', credits: 3, price: 49000, label: '۳ خروجی اضافه' },
  { id: 'topup-10', credits: 10, price: 129000, label: '۱۰ خروجی اضافه' },
  { id: 'topup-50', credits: 50, price: 499000, label: '۵۰ خروجی اضافه' },
];

export const RETRY_WINDOW_MINUTES = 30;
export const TIMEZONE = 'Asia/Tehran';

export function getPlanById(id: CreditPlanId): CreditPlan | undefined {
  return CREDIT_PLANS.find((p) => p.id === id);
}

export function getTopUpById(id: string): TopUpPack | undefined {
  return TOP_UP_PACKS.find((t) => t.id === id);
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('fa-IR');
}
