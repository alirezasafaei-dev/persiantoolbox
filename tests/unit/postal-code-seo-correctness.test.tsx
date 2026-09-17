import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PostalCodeValidator from '@/components/features/validation-tools/PostalCodeValidator';

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    recordCopy: vi.fn(),
  }),
}));

const pageSource = readFileSync(
  join(process.cwd(), 'app/(tools)/validation-tools/postal-code/page.tsx'),
  'utf8',
);
const componentSource = readFileSync(
  join(process.cwd(), 'components/features/validation-tools/PostalCodeValidator.tsx'),
  'utf8',
);

describe('postal code SEO and correctness contract', () => {
  it('targets the GSC intent with truthful page metadata while preserving the canonical route', () => {
    expect(pageSource).toContain("title: 'اعتبارسنجی کد پستی آنلاین رایگان | جعبه ابزار فارسی'");
    expect(pageSource).toContain('description:');
    expect(pageSource).toContain(
      'ساختار کد پستی ۱۰ رقمی ایران را آنلاین و رایگان بررسی کنید. اعتبارسنجی در مرورگر انجام می‌شود و جایگزین استعلام رسمی نشانی از شرکت پست نیست.',
    );
    expect(pageSource).toContain("'اعتبار سنجی کد پستی'");
    expect(pageSource).toContain('path: tool.path');
  });

  it('exposes one intent-aligned H1 and clearly limits the claim to structural validation', () => {
    expect(componentSource).toContain('<h1');
    expect(componentSource).toContain('اعتبارسنجی کد پستی آنلاین');
    expect(componentSource).toContain('فقط ساختار کد پستی ۱۰ رقمی را بررسی می‌کند');
    expect(componentSource).toMatch(/جایگزین استعلام رسمی نشانی از شرکت\s+پست نیست/);
  });

  it('accepts Persian digits instead of stripping them before validation', async () => {
    const user = userEvent.setup();
    render(<PostalCodeValidator />);

    const input = screen.getByRole('textbox', { name: 'کدپستی ۱۰ رقمی' });
    await user.type(input, '۱۴۶۵۷۱۴۳۹۱');

    expect(input).toHaveValue('14657-14391');
    expect(screen.getByText('معتبر')).toBeInTheDocument();
  });
});
