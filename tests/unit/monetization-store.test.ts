import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'persian-tools.monetization.v1';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.setSystemTime(new Date('2026-06-07T12:00:00.000Z'));
});

describe('monetization store', () => {
  it('recovers from malformed persisted data with a clean v1 store', async () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');

    const { getMonetizationStore } = await import('@/shared/monetization/monetizationStore');

    expect(getMonetizationStore()).toEqual({
      slots: [],
      campaigns: [],
      lastUpdated: null,
      version: 1,
    });
  });

  it('normalizes persisted slots and campaigns before exposing them to the admin UI', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        slots: [
          {
            id: 'slot-1',
            name: ` Main ${'x'.repeat(220)}`,
            placement: '',
            size: '',
            active: 'yes',
            createdAt: 1780833600000,
            updatedAt: 'bad',
          },
          { id: '', name: 'broken', createdAt: 1780833600000 },
        ],
        campaigns: [
          {
            id: 'campaign-1',
            name: 'Campaign',
            sponsor: '',
            targetUrl: 'ftp://example.test/ad',
            assetUrl: 'https://cdn.example.test/banner.png?cache=1',
            slotId: 'missing-slot',
            status: 'archived',
            createdAt: 1780833600000,
            updatedAt: null,
          },
        ],
        lastUpdated: 'bad',
        version: 999,
      }),
    );

    const { getMonetizationStore } = await import('@/shared/monetization/monetizationStore');
    const store = getMonetizationStore();

    expect(store.version).toBe(1);
    expect(store.lastUpdated).toBeNull();
    expect(store.slots).toHaveLength(1);
    expect(store.slots[0]).toMatchObject({
      id: 'slot-1',
      placement: 'inline',
      size: 'auto',
      active: true,
      updatedAt: null,
    });
    expect(store.slots[0]?.name.length).toBeLessThanOrEqual(160);
    expect(store.campaigns).toEqual([
      {
        id: 'campaign-1',
        name: 'Campaign',
        sponsor: 'نامشخص',
        targetUrl: '#',
        assetUrl: 'https://cdn.example.test/banner.png?cache=1',
        slotId: null,
        status: 'active',
        createdAt: 1780833600000,
        updatedAt: null,
      },
    ]);
  });

  it('preserves immutable record fields and detaches campaigns when removing a slot', async () => {
    const { addAdSlot, addCampaign, removeAdSlot, updateAdSlot } =
      await import('@/shared/monetization/monetizationStore');

    const withSlot = addAdSlot({
      name: 'Hero',
      placement: 'header',
      size: '728x90',
      active: true,
    });
    const slot = withSlot.slots[0];
    if (!slot) {
      throw new Error('Expected slot to be created');
    }

    const changedSlot = updateAdSlot(slot.id, {
      id: 'attacker-id',
      createdAt: 1,
      active: false,
    }).slots[0];

    expect(changedSlot?.id).toBe(slot.id);
    expect(changedSlot?.createdAt).toBe(slot.createdAt);
    expect(changedSlot?.active).toBe(false);

    const withCampaign = addCampaign({
      name: 'Launch',
      sponsor: 'Sponsor',
      targetUrl: '/pro',
      assetUrl: '/ads/launch.png',
      slotId: slot.id,
      status: 'active',
    });

    expect(withCampaign.campaigns[0]?.slotId).toBe(slot.id);
    expect(removeAdSlot(slot.id).campaigns[0]?.slotId).toBeNull();
  });
});
