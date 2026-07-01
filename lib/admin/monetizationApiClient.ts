import type { AdCampaign, AdSlot } from '@/shared/monetization/monetizationStore';

type MonetizationResponse = {
  ok?: boolean;
  data?: { slots: AdSlot[]; campaigns: AdCampaign[] };
  errors?: string[];
};

async function postMonetization(body: Record<string, unknown>) {
  const response = await fetch('/api/admin/monetization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as MonetizationResponse & { data?: AdSlot | AdCampaign };
  return { response, payload };
}

export async function fetchMonetizationData(): Promise<{
  slots: AdSlot[];
  campaigns: AdCampaign[];
  error: string | null;
}> {
  const response = await fetch('/api/admin/monetization', { cache: 'no-store' });
  const payload = (await response.json()) as MonetizationResponse;
  if (!response.ok || !payload.ok || !payload.data) {
    return {
      slots: [],
      campaigns: [],
      error: payload.errors?.[0] ?? 'بارگذاری داده‌های تبلیغات با خطا مواجه شد.',
    };
  }
  return { slots: payload.data.slots, campaigns: payload.data.campaigns, error: null };
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
