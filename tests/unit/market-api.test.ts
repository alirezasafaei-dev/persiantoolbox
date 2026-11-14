import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/logger', () => ({ logger: { error: vi.fn() } }));
const rates = { USD: 1, EUR: 0.9, GBP: 0.8, AED: 3.67, TRY: 40, IRR: 1000000 };
let currency: unknown;
let crypto: unknown;
let gold: unknown;
const fetchSource = vi.fn(async (url: string) => ({
  ok: true,
  json: async () =>
    url.includes('exchangerate') ? currency : url.includes('tether-gold') ? gold : crypto,
}));
beforeEach(() => {
  vi.resetModules();
  fetchSource.mockClear();
  currency = { rates };
  crypto = {
    bitcoin: { usd: 80000, usd_24h_change: 1 },
    ethereum: { usd: 3000, usd_24h_change: -1 },
  };
  gold = { 'tether-gold': { usd: 3000, usd_24h_change: 0 } };
  vi.stubGlobal('fetch', fetchSource);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it.each([{}, { rates: { ...rates, IRR: -1 } }, { rates: { ...rates, EUR: '0.9' } }])(
  'rejects an invalid currency snapshot instead of labelling default rates live: %j',
  async (payload) => {
    currency = payload;
    const { GET } = await import('@/app/api/market/route');
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(await response.json()).toMatchObject({ ok: false });
  },
);
it('rejects a missing crypto quote', async () => {
  crypto = {};
  const { GET } = await import('@/app/api/market/route');
  expect((await GET()).status).toBe(503);
});
it.each([Number.MAX_VALUE, Number.MIN_VALUE])(
  'rejects an invalid derived gold price from finite positive inputs: %s',
  async (price) => {
    gold = { 'tether-gold': { usd: price, usd_24h_change: 0 } };
    const { GET } = await import('@/app/api/market/route');
    expect((await GET()).status).toBe(503);
  },
);
it('shares concurrent refresh work and preserves the original timestamp on upstream failure', async () => {
  vi.useFakeTimers();
  const { GET } = await import('@/app/api/market/route');
  const responses = await Promise.all([GET(), GET(), GET()]);
  expect(fetchSource).toHaveBeenCalledTimes(3);
  const initial = await responses[0].json();
  expect(initial.data.freshness).toBe('live');
  expect((await (await GET()).json()).data.freshness).toBe('cached');
  vi.advanceTimersByTime(5 * 60 * 1000 + 1);
  currency = {};
  const stale = await (await GET()).json();
  expect(stale.data.freshness).toBe('stale');
  expect(stale.data.timestamp).toBe(initial.data.timestamp);
  expect(stale.data.currencies.IRR.rate).toBe(1000000);
  await GET();
  expect(fetchSource).toHaveBeenCalledTimes(6);
});
