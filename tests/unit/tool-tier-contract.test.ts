import { describe, expect, it } from 'vitest';
import { getTierByPath, toolsRegistry } from '@/lib/tools-registry';

describe('tool tier contract', () => {
  it('resolves a deterministic tier for all registry entries', () => {
    for (const tool of toolsRegistry) {
      expect(tool.tier).toMatch(/^(Offline-Guaranteed|Hybrid|Online-Required)$/);
    }
  });

  it('enforces online-required tier for /pro path family', () => {
    expect(getTierByPath('/pro')).toBe('Online-Required');
    expect(getTierByPath('/pro/checkout')).toBe('Online-Required');
  });
});
