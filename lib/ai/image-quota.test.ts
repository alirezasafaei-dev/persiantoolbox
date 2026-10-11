import { afterEach, describe, expect, it, vi } from 'vitest';

const { transaction } = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ withTransaction: transaction }));

import { ImageQuotaExceeded, consumeImageQuota, imageGenerationReady } from './image-quota';

const account = 'a'.repeat(32);
const chatAccount = 'b'.repeat(32);
function ready() {
  vi.stubEnv('FEATURE_AI_IMAGE_ENABLED', 'true');
  vi.stubEnv('AI_IMAGE_FREE_PLAN_CONFIRMED', 'true');
  vi.stubEnv('AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED', 'true');
  vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', account);
  vi.stubEnv('AI_IMAGE_CLOUDFLARE_TOKEN', 'test-only-image-credential');
  vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', chatAccount);
  vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'test-only-chat-credential');
  vi.stubEnv('AI_VISITOR_SECRET', 'a-fake-signed-cookie-secret-more-than-32');
}

afterEach(() => {
  transaction.mockReset();
  vi.unstubAllEnvs();
});

describe('Fail-closed image feature and quotas', () => {
  it('is disabled without independent owner Free/account attestation', () => {
    expect(imageGenerationReady()).toBe(false);
    ready();
    expect(imageGenerationReady()).toBe(true);
    for (const flag of [
      'FEATURE_AI_IMAGE_ENABLED',
      'AI_IMAGE_FREE_PLAN_CONFIRMED',
      'AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED',
    ]) {
      vi.stubEnv(flag, 'false');
      expect(imageGenerationReady()).toBe(false);
      vi.stubEnv(flag, 'true');
    }
  });
  it('rejects use of the chat account or chat token, even with affirmative flags', () => {
    ready();
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', chatAccount);
    expect(imageGenerationReady()).toBe(false);
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', account);
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_TOKEN', 'test-only-chat-credential');
    expect(imageGenerationReady()).toBe(false);
  });
  it('rejects missing or malformed credential/config', () => {
    ready();
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', 'bad');
    expect(imageGenerationReady()).toBe(false);
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', account);
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_TOKEN', '');
    expect(imageGenerationReady()).toBe(false);
  });
  it('requires a known chat account and disallows case-variant aliases', () => {
    ready();
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', '');
    expect(imageGenerationReady()).toBe(false);
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', account.toUpperCase());
    expect(imageGenerationReady()).toBe(false);
  });
  it('reserves visitor/day, visitor/minute, isolated-account/day and account/minute atomically', async () => {
    ready();
    const query = vi.fn(async () => ({ rowCount: 1 }));
    transaction.mockImplementation(async (fn) => fn(query));
    const now = new Date('2026-10-11T23:59:52Z');
    await consumeImageQuota('dummy visitor', account, now);
    expect(transaction).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledTimes(4);
    const calls = query.mock.calls as unknown as Array<[string, [string, Date, number]]>;
    expect(calls.map((c) => c[1][2])).toEqual([1, 1, 5, 1]);
    expect(calls.map((c) => c[1][0])).toEqual(
      expect.arrayContaining([
        expect.stringContaining('image:account:day:'),
        expect.stringContaining('image:account:minute:'),
      ]),
    );
    expect(calls.every((c) => c[1][0].startsWith('image:'))).toBe(true);
    expect(calls.every((c) => !c[1][0].includes('dummy visitor'))).toBe(true);
    expect(calls[0]?.[1][1].toISOString()).toBe('2026-10-11T00:00:00.000Z');
    expect(calls[1]?.[1][1].toISOString()).toBe('2026-10-11T23:59:00.000Z');
  });
  it('enforces UTC calendar reset and still isolates accounts', async () => {
    ready();
    const query = vi.fn(async () => ({ rowCount: 1 }));
    transaction.mockImplementation(async (fn) => fn(query));
    await consumeImageQuota('same', account, new Date('2026-10-11T23:59:59Z'));
    const first = (
      query.mock.calls as unknown as Array<[string, [string, Date, number]]>
    )[0]?.[1][1].toISOString();
    query.mockClear();
    await consumeImageQuota('same', account, new Date('2026-10-12T00:00:01Z'));
    const second = (
      query.mock.calls as unknown as Array<[string, [string, Date, number]]>
    )[0]?.[1][1].toISOString();
    expect(first).toBe('2026-10-11T00:00:00.000Z');
    expect(second).toBe('2026-10-12T00:00:00.000Z');
  });
  it('fails closed when any unique counter already reached its cap', async () => {
    ready();
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 0 });
    transaction.mockImplementation(async (fn) => fn(query));
    await expect(consumeImageQuota('test', account)).rejects.toBeInstanceOf(ImageQuotaExceeded);
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('propagates database outages without granting inference', async () => {
    ready();
    transaction.mockRejectedValue(new Error('DB unavailable'));
    await expect(consumeImageQuota('test', account)).rejects.toThrow('DB unavailable');
  });
});
