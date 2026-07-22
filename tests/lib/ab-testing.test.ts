import { describe, it, expect, beforeEach } from 'vitest';
import { getVariant, clearAllTests } from '@/lib/ab-testing';

describe('A/B Testing', () => {
  beforeEach(() => {
    clearAllTests();
  });

  it('returns a valid variant from the list', () => {
    const result = getVariant({ testName: 'test1', variants: ['A', 'B'] });
    expect(['A', 'B']).toContain(result);
  });

  it('returns consistent variant for same input', () => {
    clearAllTests();
    const result1 = getVariant({ testName: 'test1', variants: ['A', 'B', 'C'] });
    clearAllTests();
    const result2 = getVariant({ testName: 'test1', variants: ['A', 'B', 'C'] });
    expect(result1).toBe(result2);
  });

  it('distributes variants roughly evenly', () => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      clearAllTests();
      const result = getVariant({ testName: `dist-${i}`, variants: ['A', 'B'] });
      counts[result] = (counts[result] || 0) + 1;
    }
    expect(counts['A']).toBeGreaterThan(400);
    expect(counts['B']).toBeGreaterThan(400);
  });
});
