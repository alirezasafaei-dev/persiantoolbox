import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type SiteSettingContractKey = {
  key: string;
  envFallback: string;
  type: 'text' | 'url';
  nullable: boolean;
  maxLength?: number;
  allowInternalPath?: boolean;
};

describe('site settings contract', () => {
  it('keeps deterministic fallback keys and constraints', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'docs/monetization/site-settings-contract.json'),
      'utf8',
    );

    const parsed = JSON.parse(raw) as { version: number; keys: SiteSettingContractKey[] };
    expect(parsed.version).toBe(1);
    expect(parsed.keys).toHaveLength(4);

    const keys = parsed.keys.map((item) => item.key).sort();
    expect(keys).toEqual(['developer_brand_text', 'developer_name', 'order_url', 'portfolio_url']);

    const envs = parsed.keys.map((item) => item.envFallback).sort();
    expect(envs).toEqual(['DEVELOPER_BRAND_TEXT', 'DEVELOPER_NAME', 'ORDER_URL', 'PORTFOLIO_URL']);

    for (const row of parsed.keys) {
      if (row.type === 'text') {
        expect(row.nullable).toBe(false);
        expect(Number.isInteger(row.maxLength)).toBe(true);
        expect((row.maxLength ?? 0) > 0).toBe(true);
      }
      if (row.type === 'url') {
        expect(row.nullable).toBe(true);
        expect(row.allowInternalPath).toBe(true);
      }
    }
  });
});
