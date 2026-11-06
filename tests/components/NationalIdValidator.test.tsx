import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NationalIdValidator from '@/components/features/validation-tools/NationalIdValidator';
import { ToastContext } from '@/shared/ui/toast-context';

function renderValidator() {
  render(
    <ToastContext.Provider value={{ showToast: () => undefined }}>
      <NationalIdValidator />
    </ToastContext.Provider>,
  );
  return screen.getByLabelText('کد ملی ۱۰ رقمی');
}

describe('NationalIdValidator localized input', () => {
  it.each([
    ['ASCII', '0010350829'],
    ['Persian', '۰۰۱۰۳۵۰۸۲۹'],
    ['Arabic-Indic', '٠٠١٠٣٥٠٨٢٩'],
    ['mixed', '۰0١۰3٥۰8۲9'],
    ['formatted Persian', '۰۰۱-۰۳۵-۰۸۲۹'],
  ])('accepts %s digits without losing leading zeros', (_name, value) => {
    const input = renderValidator();
    fireEvent.change(input, { target: { value } });
    expect(input).toHaveValue('001-035-0829');
    expect(screen.getByText('معتبر', { exact: true })).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it.each(['۰۰۱۰۳۵۰۸۲۸', '۱۱۱۱۱۱۱۱۱۱', '۰۰۱'])('rejects invalid localized input %s', (value) => {
    const input = renderValidator();
    fireEvent.change(input, { target: { value } });
    expect(screen.getByText('نامعتبر', { exact: true })).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('preserves normalized digits through hide/show and clears stale results', () => {
    const input = renderValidator();
    fireEvent.change(input, { target: { value: '۰۰۱۰۳۵۰۸۲۹' } });
    fireEvent.click(screen.getByRole('button', { name: /^مخفی$/ }));
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('0010350829');
    fireEvent.click(screen.getByRole('button', { name: /^نمایش$/ }));
    expect(input).toHaveValue('001-035-0829');
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');
    expect(screen.queryByText('معتبر', { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText('نامعتبر', { exact: true })).not.toBeInTheDocument();
  });
});
