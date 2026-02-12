import { describe, expect, it } from 'vitest';
import { scanLocalFirstViolations } from '../../scripts/quality/verify-local-first';

describe('local-first runtime gate', () => {
  it('reports no violations on current runtime code', () => {
    const violations = scanLocalFirstViolations(process.cwd());
    expect(violations).toEqual([]);
  });
});
