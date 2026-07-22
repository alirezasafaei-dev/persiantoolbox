import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('renders Vanak spelling and validates the original Persian address on maps', () => {
    render(<AddressFaToEnTool />);
    fillRequiredAddress();

    const singleLineOutput = screen.getByLabelText('خروجی تک‌خطی');
    expect(singleLineOutput).toHaveValue(expect.stringContaining('Vanak'));
    expect(singleLineOutput).not.toHaveValue(expect.stringContaining('Vnk'));

    const mapLink = screen.getByRole('link', { name: 'باز کردن در نشان' });
    expect(decodeURIComponent(mapLink.getAttribute('href') ?? '')).toContain('ونک');
    expect(decodeURIComponent(mapLink.getAttribute('href') ?? '')).not.toContain('Vanak');
  });

  it('applies a manual line correction to the copyable single-line output', async () => {
    const user = userEvent.setup();
    render(<AddressFaToEnTool />);
    fillRequiredAddress({ district: '', street: 'خیابان گلپر' });

    const lineLabel = screen.getByText('خط اول آدرس');
    const lineCard = lineLabel.parentElement?.parentElement;
    expect(lineCard).toBeInstanceOf(HTMLElement);

    await user.click(within(lineCard as HTMLElement).getByRole('button', { name: 'اصلاح املا' }));
    const correctionInput = screen.getByLabelText('اصلاح املای خط اول آدرس');
    await user.clear(correctionInput);
    await user.type(correctionInput, 'Golpar Street, No. 12');
    await user.click(within(lineCard as HTMLElement).getByRole('button', { name: 'ذخیره' }));

    const singleLineOutput = screen.getByLabelText('خروجی تک‌خطی');
    expect(singleLineOutput).toHaveValue(expect.stringContaining('Golpar Street, No. 12'));
    expect(singleLineOutput).not.toHaveValue(expect.stringContaining('Glpr'));
  });
});
