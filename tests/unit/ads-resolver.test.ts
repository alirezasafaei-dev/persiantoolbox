import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/monetizationStorage', () => ({
  getMonetizationSlots: vi.fn(),
  getMonetizationCampaigns: vi.fn(),
}));

import { getMonetizationCampaigns, getMonetizationSlots } from '@/lib/server/monetizationStorage';
import { resolveAdForPlacement } from '@/lib/server/adsResolver';

describe('ads resolver', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns active campaign for matching placement', async () => {
    vi.mocked(getMonetizationSlots).mockResolvedValue([
      {
        id: 'slot-1',
        name: 'Home Hero',
        placement: 'homepage-hero',
        size: '728x90',
        active: true,
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    vi.mocked(getMonetizationCampaigns).mockResolvedValue([
      {
        id: 'camp-1',
        name: 'Spring Sale',
        sponsor: 'Partner',
        targetUrl: 'https://example.com',
        assetUrl: '/ads/spring.png',
        slotId: 'slot-1',
        status: 'active',
        createdAt: 1,
        updatedAt: 1,
      },
    ]);

    const ad = await resolveAdForPlacement('homepage-hero');
    expect(ad?.campaignId).toBe('camp-1');
    expect(ad?.imageUrl).toBe('/ads/spring.png');
  });

  it('returns null when slot is inactive', async () => {
    vi.mocked(getMonetizationSlots).mockResolvedValue([
      {
        id: 'slot-1',
        name: 'Home Hero',
        placement: 'homepage-hero',
        size: '728x90',
        active: false,
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    vi.mocked(getMonetizationCampaigns).mockResolvedValue([]);

    const ad = await resolveAdForPlacement('homepage-hero');
    expect(ad).toBeNull();
  });
});
