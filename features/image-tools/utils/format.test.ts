import { describe, it, expect } from 'vitest';
import { formatBytesFa, formatPercentFa } from './format';

describe('image format utils', () => {
  it('formats bytes with Persian units', () => {
    expect(formatBytesFa(0)).toBe('۰ بایت');
    expect(formatBytesFa(-10)).toBe('۰ بایت');
    expect(formatBytesFa(1024)).toContain('کیلوبایت');
    expect(formatBytesFa(1024 * 1024)).toContain('مگابایت');
  });

  it('formats percent with Persian digits', () => {
    expect(formatPercentFa(0)).toBe('۰٪');
    expect(formatPercentFa(12.34, 2)).toContain('٪');
  });
});
