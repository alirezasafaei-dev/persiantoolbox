import { beforeEach, describe, expect, it } from 'vitest';
import { getOrAssignExperimentVariant } from '@/shared/monetization/adExperiment';

describe('ad experiment assignment', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('assigns deterministic variant per experiment key', () => {
    const first = getOrAssignExperimentVariant('slot-a', ['control', 'challenger']);
    const second = getOrAssignExperimentVariant('slot-a', ['control', 'challenger']);

    expect(['control', 'challenger']).toContain(first);
    expect(second).toBe(first);
  });

  it('keeps assignment isolated between keys', () => {
    const a = getOrAssignExperimentVariant('slot-a', ['control', 'challenger']);
    const b = getOrAssignExperimentVariant('slot-b', ['control', 'challenger']);

    expect(['control', 'challenger']).toContain(a);
    expect(['control', 'challenger']).toContain(b);

    const a2 = getOrAssignExperimentVariant('slot-a', ['control', 'challenger']);
    expect(a2).toBe(a);
  });
});
