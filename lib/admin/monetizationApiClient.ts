import type { AdCampaign, AdSlot } from '@/shared/monetization/monetizationStore';
import {
  clearCachedFinancialData,
  replaceCachedFinancialData,
  type AdminPaymentData,
  type AdminSubscriptionData,
} from '@/lib/admin/financialDataCache';

export type CouponData = {
  id: string;
  code: string;
  percent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: number;
  createdAt: number;
  active: boolean;
};

export type SubscriptionData = AdminSubscriptionData;
export type PaymentData = AdminPaymentData;

type MonetizationResponse = {
  ok?: boolean;
  data?: {
    slots: AdSlot[];
    campaigns: AdCampaign[];
    subscriptions: SubscriptionData[];
    payments: PaymentData[];
    coupons: CouponData[];
  };
  errors?: string[];
};

async function readJson(response: Response): Promise<MonetizationResponse> {
  try {
    return (await response.json()) as MonetizationResponse;
  } catch {
    return { ok: false, errors: ['INVALID_ADMIN_RESPONSE'] };
  }
}

async function postMonetization(body: Record<string, unknown>) {
  const response = await fetch('/api/admin/monetization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await readJson(response)) as MonetizationResponse & {
    data?: AdSlot | AdCampaign | CouponData;
  };
  return { response, payload };
}

export async function fetchMonetizationData(): Promise<{
  slots: AdSlot[];
  campaigns: AdCampaign[];
  subscriptions: SubscriptionData[];
  payments: PaymentData[];
  coupons: CouponData[];
  error: string | null;
}> {
  const response = await fetch('/api/admin/monetization', { cache: 'no-store' });
  const payload = await readJson(response);
  if (!response.ok || !payload.ok || !payload.data) {
    clearCachedFinancialData();
    return {
      slots: [],
      campaigns: [],
      subscriptions: [],
      payments: [],
      coupons: [],
      error: payload.errors?.[0] ?? 'بارگذاری داده‌های درآمد با خطا مواجه شد.',
    };
  }

  replaceCachedFinancialData({
    subscriptions: payload.data.subscriptions,
    payments: payload.data.payments,
  });
  return {
    slots: payload.data.slots,
    campaigns: payload.data.campaigns,
    subscriptions: payload.data.subscriptions,
    payments: payload.data.payments,
    coupons: payload.data.coupons,
    error: null,
  };
}

export async function createMonetizationSlot(
  input: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ slot: AdSlot | null; error: string | null }> {
  const { response, payload } = await postMonetization({ action: 'add', type: 'slot', ...input });
  if (!response.ok || !payload.ok || !payload.data) {
    return { slot: null, error: payload.errors?.[0] ?? 'افزودن اسلات با خطا مواجه شد.' };
  }
  return { slot: payload.data as AdSlot, error: null };
}

export async function updateMonetizationSlotRemote(
  id: string,
  updates: Partial<Omit<AdSlot, 'id'>>,
): Promise<{ slot: AdSlot | null; error: string | null }> {
  const { response, payload } = await postMonetization({
    action: 'update',
    type: 'slot',
    id,
    updates,
  });
  if (!response.ok || !payload.ok || !payload.data) {
    return { slot: null, error: payload.errors?.[0] ?? 'به‌روزرسانی اسلات با خطا مواجه شد.' };
  }
  return { slot: payload.data as AdSlot, error: null };
}

export async function removeMonetizationSlotRemote(id: string): Promise<{ error: string | null }> {
  const { response, payload } = await postMonetization({ action: 'remove', type: 'slot', id });
  if (!response.ok || !payload.ok) {
    return { error: payload.errors?.[0] ?? 'حذف اسلات با خطا مواجه شد.' };
  }
  return { error: null };
}

export async function createMonetizationCampaign(
  input: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ campaign: AdCampaign | null; error: string | null }> {
  const { response, payload } = await postMonetization({
    action: 'add',
    type: 'campaign',
    ...input,
  });
  if (!response.ok || !payload.ok || !payload.data) {
    return { campaign: null, error: payload.errors?.[0] ?? 'افزودن کمپین با خطا مواجه شد.' };
  }
  return { campaign: payload.data as AdCampaign, error: null };
}

export async function updateMonetizationCampaignRemote(
  id: string,
  updates: Partial<Omit<AdCampaign, 'id'>>,
): Promise<{ campaign: AdCampaign | null; error: string | null }> {
  const { response, payload } = await postMonetization({
    action: 'update',
    type: 'campaign',
    id,
    updates,
  });
  if (!response.ok || !payload.ok || !payload.data) {
    return { campaign: null, error: payload.errors?.[0] ?? 'به‌روزرسانی کمپین با خطا مواجه شد.' };
  }
  return { campaign: payload.data as AdCampaign, error: null };
}

export async function removeMonetizationCampaignRemote(
  id: string,
): Promise<{ error: string | null }> {
  const { response, payload } = await postMonetization({ action: 'remove', type: 'campaign', id });
  if (!response.ok || !payload.ok) {
    return { error: payload.errors?.[0] ?? 'حذف کمپین با خطا مواجه شد.' };
  }
  return { error: null };
}

export async function createCoupon(
  input: Omit<CouponData, 'id' | 'usedCount' | 'active' | 'createdAt'>,
): Promise<{ coupon: CouponData | null; error: string | null }> {
  const { response, payload } = await postMonetization({
    action: 'add',
    type: 'coupon',
    ...input,
  });
  if (!response.ok || !payload.ok || !payload.data) {
    return { coupon: null, error: payload.errors?.[0] ?? 'افزودن کوپن با خطا مواجه شد.' };
  }
  return { coupon: payload.data as CouponData, error: null };
}

export async function updateCouponRemote(
  id: string,
  updates: Partial<Pick<CouponData, 'code' | 'percent' | 'maxUses' | 'expiresAt' | 'active'>>,
): Promise<{ coupon: CouponData | null; error: string | null }> {
  const { response, payload } = await postMonetization({
    action: 'update',
    type: 'coupon',
    id,
    updates,
  });
  if (!response.ok || !payload.ok || !payload.data) {
    return { coupon: null, error: payload.errors?.[0] ?? 'به‌روزرسانی کوپن با خطا مواجه شد.' };
  }
  return { coupon: payload.data as CouponData, error: null };
}

export async function removeCouponRemote(id: string): Promise<{ error: string | null }> {
  const { response, payload } = await postMonetization({ action: 'remove', type: 'coupon', id });
  if (!response.ok || !payload.ok) {
    return { error: payload.errors?.[0] ?? 'حذف کوپن با خطا مواجه شد.' };
  }
  return { error: null };
}
