import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { query, withTransaction } from '@/lib/server/db';

vi.mock('@/lib/server/db', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
}));

const mockQuery = vi.mocked(query);
const mockWithTransaction = vi.mocked(withTransaction);

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  delete process.env['RATE_LIMIT_LOG'];
});

describe('makeRateLimitKey', () => {
  it('uses first x-forwarded-for IP when present', () => {
    const request = new Request('http://localhost/api', {
      headers: {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      },
    });
    expect(makeRateLimitKey('history', request, 'u1')).toBe('history:u1:10.0.0.1');
  });

  it('falls back to unknown when no IP headers exist', () => {
    const request = new Request('http://localhost/api');
    expect(makeRateLimitKey('history', request)).toBe('history:unknown');
  });
});

describe('rateLimit', () => {
  it('allows first request in a new window', async () => {
    mockWithTransaction.mockImplementation(async (fn) => {
      const txn = vi.fn(async (text: string) => {
        if (text.includes('SELECT key, count, window_start')) {
          return { rows: [], rowCount: 0 } as never;
        }
        return { rows: [], rowCount: 1 } as never;
      });
      return fn(txn as never);
    });

    const result = await rateLimit('k1', { limit: 2, windowMs: 1000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('blocks when count is over limit and logs metric when enabled', async () => {
    process.env['RATE_LIMIT_LOG'] = 'true';
    mockWithTransaction.mockImplementation(async (fn) => {
      const txn = vi.fn(async (text: string) => {
        if (text.includes('SELECT key, count, window_start')) {
          return {
            rows: [{ key: 'k2', count: 3, window_start: Date.now() }],
            rowCount: 1,
          } as never;
        }
        return { rows: [], rowCount: 1 } as never;
      });
      return fn(txn as never);
    });
    mockQuery.mockResolvedValue({ rows: [], rowCount: 1 } as never);

    const result = await rateLimit('k2', { limit: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(mockQuery).toHaveBeenCalledOnce();
  });
});
