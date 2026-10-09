import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('AI quota production migration gate', () => {
  it('runs the checked-in AI quota SQL through the canonical db:migrate entrypoint', () => {
    const script = readFileSync(join(process.cwd(), 'scripts/db/migrate.mjs'), 'utf8');
    const sql = readFileSync(
      join(process.cwd(), 'db/migrations/20261008_ai_chat_quota.sql'),
      'utf8',
    );
    expect(script).toContain('db/migrations/20261008_ai_chat_quota.sql');
    expect(script).toContain("await client.query('BEGIN')");
    expect(script).toContain('await client.query(aiQuotaMigrationSql)');
    expect(script).toContain("await client.query('COMMIT')");
    expect(script).toContain("await client.query('ROLLBACK')");
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS ai_chat_quota/i);
    expect(sql).toMatch(/PRIMARY KEY \(quota_key, bucket_start\)/i);
  });
});
