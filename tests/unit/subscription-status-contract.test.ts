import { describe, expect, it } from 'vitest';
import { normalizeSubscriptionStatus } from '@/shared/hooks/useSubscriptionStatus';

describe('Subscription status contract', () => {
  it('normalizes active API response with planId', () => {
    const status = normalizeSubscriptionStatus({
      subscription: {
        id: 'pack-3',
        planId: 'pack-3',
        active: true,
        expiresAt: '2026-07-29T00:00:00.000Z',
      },
      usage: { isPremium: true },
    });

    expect(status).toEqual({
      isPremium: true,
      planId: 'pack-3',
      expiresAt: '2026-07-29T00:00:00.000Z',
    });
  });

  it('supports legacy response shape that only has id', () => {
    const status = normalizeSubscriptionStatus({
      subscription: {
        id: 'basic',
        expiresAt: 1785283200000,
      },
    });

    expect(status).toEqual({
      isPremium: true,
      planId: 'basic',
      expiresAt: '1785283200000',
    });
  });

  it('does not treat expired legacy subscriptions as premium', () => {
    const status = normalizeSubscriptionStatus({
      subscription: {
        id: 'basic',
        expiresAt: '2020-01-01T00:00:00.000Z',
      },
    });

    expect(status).toEqual({
      isPremium: false,
      planId: 'basic',
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
  });

  it('keeps logged-out or free users in free state', () => {
    const status = normalizeSubscriptionStatus({
      subscription: null,
      usage: { isPremium: false },
    });

    expect(status).toEqual({
      isPremium: false,
      planId: null,
      expiresAt: null,
    });
  });
});
