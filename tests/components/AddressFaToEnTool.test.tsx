import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AddressFaToEnTool from '@/components/features/text-tools/AddressFaToEnTool';

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    recordCopy: vi.fn(),
  }),
}));

function fillRequiredAddress({
  district = 'و‌نك',
  street = 'خیابان ولیعصر',
}: {
  district?: string;
  street?: string;
} = {}) {
  fireEvent.change(screen.getByLabelText('استان'), { target: { value: 'تهران' } });
  fireEvent.change(screen.getByLabelText('شهر'), { target: { value: 'تهران' } });
  fireEvent.change(screen.getByLabelText('محله'), { target: { value: district } });
  fireEvent.change(screen.getByLabelText('خیابان'), { target: { value: street } });
  fireEvent.change(screen.getByLabelText('پلاک'), { target: { value: '12' } });
}

describe('AddressFaToEnTool', () => {
  it('renders canonical Vanak spelling for Unicode input variants', () => {
    render(<AddressFaToEnTool />);
    fillRequiredAddress();

    const singleLineOutput = screen.getByLabelText('خروجی تک‌خطی');
    expect(singleLineOutput).toHaveValue(expect.stringContaining('Vanak'));
    expect(singleLineOutput).not.toHaveValue(expect.stringContaining('Vnk'));
    expect(screen.getByText('املای واژه‌نامه‌ای')).toBeVisible();
  });

  it('surfaces unknown proper names as spelling-review terms', () => {
    render(<AddressFaToEnTool />);
    fillRequiredAddress({ district: '', street: 'خیابان گلپر' });

    expect(screen.getByText('نیازمند بازبینی املا')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'املای تخمینی را بررسی کنید' })).toBeVisible();
    expect(screen.getByText('گلپر')).toBeVisible();
  });
});
