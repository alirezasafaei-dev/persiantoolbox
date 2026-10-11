import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const { state } = vi.hoisted(() => ({ state: { pool: null as Pool | null } }));

// Real PostgreSQL transactions, with the project's actual quota SQL, on a
// disposable database only. Never run against a production database.
vi.mock('@/lib/server/db', () => ({
  withTransaction: async (
    fn: (query: (sql: string, values?: unknown[]) => Promise<unknown>) => Promise<unknown>,
  ) => {
    if (!state.pool) {
      throw new Error('Disposable PostgreSQL pool missing');
    }
    const client = await state.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn((sql, values = []) => client.query(sql, values));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
}));

import { consumeImageQuota, ImageQuotaExceeded } from '@/lib/ai/image-quota';

const connection = process.env['TEST_IMAGE_DATABASE_URL'];
const valid = (() => {
  if (!connection) {
    return false;
  }
  try {
    const url = new URL(connection);
    return (
      url.protocol === 'postgres:' &&
      url.hostname === '127.0.0.1' &&
      (url.port === '55439' ||
        (url.port === '5432' && process.env['TEST_IMAGE_DB_CONTAINER'] === 'isolated-only')) &&
      url.pathname === '/pt_image_test' &&
      url.username === 'unit'
    );
  } catch {
    return false;
  }
})();

const account = 'a'.repeat(32);

describe.skipIf(!valid)('Image quota atomicity on disposable PostgreSQL only', () => {
  beforeAll(async () => {
    state.pool = new Pool({ connectionString: connection, max: 12 });
    vi.stubEnv('FEATURE_AI_IMAGE_ENABLED', 'true');
    vi.stubEnv('AI_IMAGE_FREE_PLAN_CONFIRMED', 'true');
    vi.stubEnv('AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED', 'true');
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_ACCOUNT_ID', account);
    vi.stubEnv('AI_IMAGE_CLOUDFLARE_TOKEN', 'disposable-token');
    vi.stubEnv('AI_CLOUDFLARE_ACCOUNT_ID', 'b'.repeat(32));
    vi.stubEnv('AI_CLOUDFLARE_TOKEN', 'other-disposable-token');
    vi.stubEnv('AI_VISITOR_SECRET', 'synthetic-test-only-secret-32-bytes-minimum');
    await state.pool.query(`CREATE TABLE IF NOT EXISTS ai_chat_quota (
      quota_key TEXT NOT NULL,
      bucket_start TIMESTAMPTZ NOT NULL,
      hits INTEGER NOT NULL DEFAULT 0 CHECK (hits >= 0),
      PRIMARY KEY (quota_key, bucket_start)
    )`);
  });
  afterEach(async () => {
    await state.pool?.query('TRUNCATE TABLE ai_chat_quota');
  });
  afterAll(async () => {
    await state.pool?.query('DROP TABLE IF EXISTS ai_chat_quota');
    await state.pool?.end();
    state.pool = null;
    vi.unstubAllEnvs();
  });

  it('permits exactly one of 12 concurrent submissions within the same minute', async () => {
    const at = new Date('2026-10-11T13:40:00Z');
    const submissions = Array.from({ length: 12 }, (_, i) =>
      consumeImageQuota(`disposable-visitor-${i}`, account, at),
    );
    const settled = await Promise.allSettled(submissions);
    expect(settled.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(settled.filter((r) => r.status === 'rejected')).toHaveLength(11);
    for (const item of settled) {
      if (item.status === 'rejected') {
        expect(item.reason).toBeInstanceOf(ImageQuotaExceeded);
      }
    }
    const { rows } = await state.pool!.query<{ quota_key: string; hits: number }>(
      'SELECT quota_key, hits FROM ai_chat_quota',
    );
    expect(rows).toHaveLength(4);
    expect(rows.every((row) => row.hits === 1)).toBe(true);
  });

  it('blocks the sixth UTC-day attempt and rolls back all its counters', async () => {
    for (let i = 0; i < 5; i += 1) {
      await consumeImageQuota(`safe-visitor-${i}`, account, new Date(`2026-10-11T13:0${i}:00Z`));
    }
    await expect(
      consumeImageQuota('safe-visitor-6', account, new Date('2026-10-11T13:06:00Z')),
    ).rejects.toBeInstanceOf(ImageQuotaExceeded);

    const res = await state.pool!.query<{ hits: number }>(
      "SELECT hits FROM ai_chat_quota WHERE quota_key LIKE 'image:account:day:%'",
    );
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0]?.hits).toBe(5);
    const allRows = await state.pool!.query('SELECT quota_key FROM ai_chat_quota');
    expect(allRows.rowCount).toBe(16);
  });
});
