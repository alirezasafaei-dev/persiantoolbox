import { describe, it, expect, beforeEach, vi } from 'vitest';

function mockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

describe('useUsageLimits', () => {
  let localStorageMock: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    localStorageMock = mockLocalStorage();
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('window', { localStorage: localStorageMock });
  });

  it('trackToolUsage starts at 0 and increments', async () => {
    const { trackToolUsage } = await import('@/shared/hooks/useUsageLimits');
    const result1 = trackToolUsage('test-tool');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(9);

    const result2 = trackToolUsage('test-tool');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(8);
  });

  it('getToolUsage returns fresh state for new tool', async () => {
    const { getToolUsage } = await import('@/shared/hooks/useUsageLimits');
    const usage = getToolUsage('new-tool');
    expect(usage.used).toBe(0);
    expect(usage.remaining).toBe(10);
    expect(usage.limit).toBe(10);
  });

  it('blocks after 10 uses', async () => {
    const { trackToolUsage, getToolUsage } = await import('@/shared/hooks/useUsageLimits');
    for (let i = 0; i < 10; i++) {
      trackToolUsage('limit-tool');
    }
    const result = trackToolUsage('limit-tool');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);

    const usage = getToolUsage('limit-tool');
    expect(usage.remaining).toBe(0);
  });

  it('tracks different tools independently', async () => {
    const { trackToolUsage, getToolUsage } = await import('@/shared/hooks/useUsageLimits');
    trackToolUsage('tool-a');
    trackToolUsage('tool-a');
    trackToolUsage('tool-b');

    expect(getToolUsage('tool-a').used).toBe(2);
    expect(getToolUsage('tool-b').used).toBe(1);
  });
});
