import { describe, expect, it } from 'vitest';
import { getTierByPath, getToolsByCategory, toolsRegistry } from '@/lib/tools-registry';

describe('tool tier contract', () => {
  it('resolves a deterministic tier for all registry entries', () => {
    for (const tool of toolsRegistry) {
      expect(tool.tier).toMatch(/^(Offline-Guaranteed|Local-Processing|Hybrid|Online-Required)$/);
    }
  });

  it('marks the PDF hub and its tools as local processing without promising offline navigation', () => {
    expect(getTierByPath('/pdf-tools')).toBe('Local-Processing');
    const tools = getToolsByCategory('pdf-tools').filter((tool) => tool.kind === 'tool');
    expect(tools).toHaveLength(17);
    for (const tool of tools) {
      expect(getTierByPath(tool.path)).toBe('Local-Processing');
    }
  });

  it('enforces online-required tier for /pro path family', () => {
    expect(getTierByPath('/pro')).toBe('Online-Required');
    expect(getTierByPath('/pro/checkout')).toBe('Online-Required');
  });
});
