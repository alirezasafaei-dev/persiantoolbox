import { describe, it, expect } from 'vitest';
import { normalizeShareExpiryHours } from '@/shared/history/share';

describe('History Share Expiry', () => {
  it('should default when input is missing', () => {
    expect(normalizeShareExpiryHours()).toBe(24);
  });

  it('should clamp to min and max', () => {
    expect(normalizeShareExpiryHours(0)).toBe(1);
    expect(normalizeShareExpiryHours(999)).toBe(168);
  });

  it('should round valid values', () => {
    expect(normalizeShareExpiryHours(12.2)).toBe(12);
    expect(normalizeShareExpiryHours(12.7)).toBe(13);
  });
});
