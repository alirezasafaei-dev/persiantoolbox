import { getMonetizationCampaigns, getMonetizationSlots } from '@/lib/server/monetizationStorage';

export type ResolvedAd = {
  placement: string;
  slotId: string;
  campaignId: string;
  imageUrl: string;
  targetUrl: string;
  alt: string;
  sponsor: string;
};

const PLACEHOLDER_AD: ResolvedAd = {
  placement: 'fallback',
  slotId: 'placeholder',
  campaignId: 'placeholder',
  imageUrl: '/ads/placeholder-banner.png',
  targetUrl: '/',
  alt: 'تبلیغات',
  sponsor: 'PersianToolbox',
};

export async function resolveAdForPlacement(placement: string): Promise<ResolvedAd | null> {
  const normalizedPlacement = placement.trim();
  if (!normalizedPlacement) {
    return null;
  }

  const [slots, campaigns] = await Promise.all([
    getMonetizationSlots(),
    getMonetizationCampaigns(),
  ]);

  const activeSlot = slots.find((slot) => slot.active && slot.placement === normalizedPlacement);
  if (!activeSlot) {
    return null;
  }

  const activeCampaign = campaigns.find(
    (campaign) =>
      campaign.status === 'active' &&
      campaign.slotId === activeSlot.id &&
      campaign.assetUrl.trim().length > 0,
  );
  if (!activeCampaign) {
    return null;
  }

  return {
    placement: normalizedPlacement,
    slotId: activeSlot.id,
    campaignId: activeCampaign.id,
    imageUrl: activeCampaign.assetUrl,
    targetUrl: activeCampaign.targetUrl,
    alt: activeCampaign.name || activeCampaign.sponsor || 'تبلیغات',
    sponsor: activeCampaign.sponsor,
  };
}

export async function resolveAdForPlacementWithFallback(placement: string): Promise<ResolvedAd> {
  const resolved = await resolveAdForPlacement(placement);
  if (resolved) {
    return resolved;
  }
  return { ...PLACEHOLDER_AD, placement };
}
