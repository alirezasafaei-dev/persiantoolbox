import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type ReviewItem = {
  id: string;
  title: string;
  source: string;
  decision: 'scale' | 'hold' | 'rollback';
  priority: 'P0' | 'P1' | 'P2';
  order: number;
  labels: string[];
  kpiTargets: string[];
  owner: string;
};

describe('monetization review-backlog contract', () => {
  it('keeps deterministic and complete backlog items', () => {
    const raw = readFileSync(
      resolve(process.cwd(), 'docs/monetization/review-backlog.json'),
      'utf8',
    );
    const parsed = JSON.parse(raw) as { version: number; items: ReviewItem[] };

    expect(parsed.version).toBe(1);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items.length).toBeGreaterThan(0);

    const ids = new Set<string>();
    let lastOrder = 0;
    for (const item of parsed.items) {
      expect(item.id).toMatch(/^MON-REV-\d{3}$/);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(item.order).toBeGreaterThan(lastOrder);
      lastOrder = item.order;

      expect(item.title.trim().length).toBeGreaterThan(5);
      expect(item.source.trim().length).toBeGreaterThan(3);
      expect(item.labels.length).toBeGreaterThan(0);
      expect(item.kpiTargets.length).toBeGreaterThan(0);
    }
  });
});
