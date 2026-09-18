import { describe, expect, it } from 'vitest';
import { getButtonClasses, type ButtonVariant } from '@/shared/ui/buttonStyles';

describe('button style semantic contract across Tailwind migrations', () => {
  it('keeps outline as the public variant name and maps it to btn-outline', () => {
    const variant: ButtonVariant = 'outline';
    expect(getButtonClasses({ variant })).toContain('btn-outline');
  });
});
