import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AddressFaToEnTool from '@/components/features/text-tools/AddressFaToEnTool';

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

async function enterAddress(user: ReturnType<typeof userEvent.setup>) {
  for (const [label, value] of [
    ['استان', 'تهران'],
    ['شهر', 'تهران'],
    ['خیابان', 'خیابان فرشته'],
    ['پلاک', '۱۲'],
  ] as const)
    await user.type(screen.getByLabelText(label), value);
}

async function correctLine(user: ReturnType<typeof userEvent.setup>) {
  const card = screen.getByText('خط اول آدرس', { exact: true }).parentElement!.parentElement!;
  await user.click(within(card).getByRole('button', { name: 'اصلاح املا' }));
  const input = screen.getByLabelText('اصلاح املای خط اول آدرس');
  await user.clear(input);
  await user.type(input, 'Fereshteh St, No. 12{Enter}');
}

describe('manual address corrections', () => {
  it.each(['پستی دقیق', 'خوانا'])(
    'uses the corrected line in every output and clipboard in %s mode',
    async (mode) => {
      const user = userEvent.setup();
      render(<AddressFaToEnTool compact />);
      await enterAddress(user);
      await user.click(screen.getByRole('button', { name: mode }));
      await correctLine(user);
      expect(screen.getByLabelText<HTMLTextAreaElement>('خروجی تک‌خطی').value).toContain(
        'Fereshteh St, No. 12',
      );
      await user.click(screen.getByRole('button', { name: 'کپی تک‌خطی' }));
      expect(await navigator.clipboard.readText()).toContain('Fereshteh St, No. 12');
      await user.click(screen.getByRole('button', { name: 'کپی چندخطی' }));
      expect(await navigator.clipboard.readText()).toContain('Fereshteh St, No. 12');
      await user.click(screen.getByRole('button', { name: 'کپی کل خروجی' }));
      expect(await navigator.clipboard.readText()).toContain('Address: Fereshteh St, No. 12');
      await user.click(screen.getByRole('button', { name: 'خروجی خوانا' }));
      await user.click(screen.getByRole('button', { name: 'کپی کل خروجی' }));
      expect(await navigator.clipboard.readText()).toContain('Fereshteh St, No. 12');
    },
  );

  it('keeps corrections across output modes and discards them when the source address changes', async () => {
    const user = userEvent.setup();
    render(<AddressFaToEnTool compact />);
    await enterAddress(user);
    await correctLine(user);
    await user.click(screen.getByRole('button', { name: 'خوانا' }));
    expect(screen.getByLabelText<HTMLTextAreaElement>('خروجی تک‌خطی').value).toContain(
      'Fereshteh St',
    );
    await user.clear(screen.getByLabelText('خیابان'));
    await user.type(screen.getByLabelText('خیابان'), 'خیابان ولیعصر');
    expect(screen.getByLabelText<HTMLTextAreaElement>('خروجی تک‌خطی').value).toContain('Valiasr');
    expect(screen.getByLabelText<HTMLTextAreaElement>('خروجی تک‌خطی').value).not.toContain(
      'Fereshteh',
    );
  });

  it('discards an unfinished correction when the source address changes', async () => {
    const user = userEvent.setup();
    render(<AddressFaToEnTool compact />);
    await enterAddress(user);
    const card = screen.getByText('خط اول آدرس', { exact: true }).parentElement!.parentElement!;
    await user.click(within(card).getByRole('button', { name: 'اصلاح املا' }));
    await user.clear(screen.getByLabelText('اصلاح املای خط اول آدرس'));
    await user.type(screen.getByLabelText('اصلاح املای خط اول آدرس'), 'OLD ADDRESS');
    await user.type(screen.getByLabelText('پلاک'), '۳');
    expect(screen.queryByLabelText('اصلاح املای خط اول آدرس')).not.toBeInTheDocument();
    expect(screen.getByLabelText<HTMLTextAreaElement>('خروجی تک‌خطی').value).not.toContain(
      'OLD ADDRESS',
    );
  });

  it.each(['پستی دقیق', 'خوانا'])(
    'uses a corrected city in maps, report and templates in %s mode',
    async (mode) => {
      const user = userEvent.setup();
      render(<AddressFaToEnTool compact />);
      await enterAddress(user);
      await user.clear(screen.getByLabelText('شهر'));
      await user.type(screen.getByLabelText('شهر'), 'شهر آزمایشی');
      await user.click(screen.getByRole('button', { name: mode }));
      const card = screen.getByText('شهر', { selector: 'span', exact: true }).parentElement!
        .parentElement!;
      await user.click(within(card).getByRole('button', { name: 'اصلاح املا' }));
      await user.clear(screen.getByLabelText('اصلاح املای شهر'));
      await user.type(screen.getByLabelText('اصلاح املای شهر'), 'Test City{Enter}');
      expect(screen.getByLabelText<HTMLTextAreaElement>('خروجی تک‌خطی').value).toContain(
        'Test City',
      );
      for (const name of ['باز کردن در نشان', 'باز کردن در بلد']) {
        expect(
          decodeURIComponent(screen.getByRole('link', { name }).getAttribute('href')!),
        ).toContain('Test City');
      }
      await user.click(screen.getByRole('button', { name: 'کپی چندخطی' }));
      expect(await navigator.clipboard.readText()).toContain('Test City');
      await user.click(screen.getByRole('button', { name: 'کپی کل خروجی' }));
      expect(await navigator.clipboard.readText()).toContain('City: Test City');
      await user.click(screen.getByRole('button', { name: 'کپی گزارش خطا' }));
      const report = JSON.parse(await navigator.clipboard.readText());
      expect(report.generated.city).toBe('Test City');
      expect(report.generated.singleLine).toContain('Test City');
      expect(report.input.city).toBe('شهر آزمایشی');
    },
  );
});
