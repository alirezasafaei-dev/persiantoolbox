import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InvoiceGenerator from '@/components/features/finance/InvoiceGenerator';
import { formatMoneyFa } from '@/shared/utils';

const mocks = vi.hoisted(() => {
  const drawText = vi.fn();
  const font = { widthOfTextAtSize: () => 20 };
  const pdf = {
    registerFontkit: vi.fn(),
    embedFont: vi.fn().mockResolvedValue(font),
    addPage: () => ({ getSize: () => ({ width: 595, height: 842 }), drawText, drawLine: vi.fn() }),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };
  return {
    pdf,
    drawText,
    create: vi.fn().mockResolvedValue(pdf),
    showToast: vi.fn(),
    download: vi.fn(),
    missingCharacter: false,
  };
});

vi.mock('pdf-lib', () => {
  return { PDFDocument: { create: mocks.create }, rgb: () => ({ red: 0, green: 0, blue: 0 }) };
});
vi.mock('@pdf-lib/fontkit', () => {
  return { default: {} };
});
vi.mock('@/lib/invoice-tools/rtl-pdf', () => ({
  createInvoiceFont: vi.fn(
    async (_doc: unknown, _bytes: unknown, onMissing?: (text: string) => void) => {
      if (mocks.missingCharacter) onMissing?.('😀');
      return {
        wrap: (value: string) => [value],
        measure: () => 20,
        draw: (page: { drawText: typeof mocks.drawText }, value: string, options: object) =>
          page.drawText(value, options),
      };
    },
  ),
  finishInvoiceFonts: vi.fn(),
}));
vi.mock('@/shared/ui/toast-context', () => ({ useToast: () => ({ showToast: mocks.showToast }) }));

const change = (label: string, value: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value } });
};
const exportButton = () => screen.getByRole('button', { name: 'دانلود فاکتور PDF' });
const drawnText = () => mocks.drawText.mock.calls.map(([text]) => text);
const changeSecondRow = (role: 'textbox' | 'spinbutton', name: string, value: string) => {
  const input = screen.getAllByRole(role, { name })[1];
  if (!input) {
    throw new Error(`Missing second row input: ${name}`);
  }
  fireEvent.change(input, { target: { value } });
};

beforeEach(() => {
  mocks.missingCharacter = false;
  vi.clearAllMocks();
  mocks.create.mockResolvedValue(mocks.pdf);
  mocks.pdf.embedFont.mockResolvedValue({ widthOfTextAtSize: () => 20 });
  mocks.pdf.save.mockResolvedValue(new Uint8Array([1, 2, 3]));
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }),
  );
  vi.stubGlobal(
    'URL',
    class extends URL {
      static override createObjectURL = vi.fn(() => 'blob:invoice-test');
      static override revokeObjectURL = vi.fn();
    },
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(mocks.download);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('InvoiceGenerator export journey', () => {
  it('warns when unsupported symbols were visibly replaced in a downloaded PDF', async () => {
    mocks.missingCharacter = true;
    render(<InvoiceGenerator />);
    fireEvent.click(exportButton());
    await waitFor(() => expect(mocks.download).toHaveBeenCalledOnce());
    expect(mocks.showToast).toHaveBeenCalledWith(
      'برخی نمادها در PDF با علامت � نمایش داده شدند. فایل را پیش از ارسال بررسی کنید.',
      'info',
    );
  });
  it.each(['', '0'])('keeps preview and PDF totals equal when quantity is %j', async (quantity) => {
    render(<InvoiceGenerator />);
    change('شرح', 'خدمت آزمایشی');
    change('قیمت واحد', '100,000');
    fireEvent.change(screen.getByRole('spinbutton', { name: 'تعداد' }), {
      target: { value: quantity },
    });
    expect(screen.getAllByText(`${formatMoneyFa(0)} تومان`)).toHaveLength(2);

    fireEvent.click(exportButton());
    await waitFor(() => expect(mocks.download).toHaveBeenCalledOnce());
    expect(drawnText()).toContain(`جمع کل: ${formatMoneyFa(0)} تومان`);
    expect(drawnText()).toContain(`مبلغ قابل پرداخت: ${formatMoneyFa(0)} تومان`);
  });

  it('preserves explicit fractional quantities, multiple rows, tax and discount in the PDF', async () => {
    render(<InvoiceGenerator />);
    change('شرح', 'خدمت آزمایشی');
    change('قیمت واحد', '100,000');
    fireEvent.change(screen.getByRole('spinbutton', { name: 'تعداد' }), {
      target: { value: '1.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+ افزودن ردیف' }));
    changeSecondRow('textbox', 'شرح', 'کالا');
    changeSecondRow('textbox', 'قیمت واحد', '50,000');
    changeSecondRow('spinbutton', 'تعداد', '2');
    change('نرخ مالیات', '10');
    change('تخفیف', '5,000');
    expect(screen.getByText(`${formatMoneyFa(270000)} تومان`)).toBeInTheDocument();

    fireEvent.click(exportButton());
    await waitFor(() => expect(mocks.download).toHaveBeenCalledOnce());
    expect(drawnText()).toContain(`جمع کل: ${formatMoneyFa(250000)} تومان`);
    expect(drawnText()).toContain(`مالیات (10%): ${formatMoneyFa(25000)} تومان`);
    expect(drawnText()).toContain(`مبلغ قابل پرداخت: ${formatMoneyFa(270000)} تومان`);
  });

  it.each(['PDF creation', 'regular font loading'])(
    'shows a Persian error after failed %s and allows a successful retry',
    async (failure) => {
      render(<InvoiceGenerator />);
      if (failure === 'PDF creation') {
        mocks.create.mockRejectedValueOnce(new Error('export unavailable'));
      } else {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('font unavailable'));
      }
      fireEvent.click(exportButton());
      await waitFor(() =>
        expect(mocks.showToast).toHaveBeenCalledWith(
          'ساخت فایل PDF انجام نشد. دوباره تلاش کنید.',
          'error',
        ),
      );
      expect(exportButton()).toBeEnabled();
      expect(mocks.download).not.toHaveBeenCalled();

      fireEvent.click(exportButton());
      await waitFor(() => expect(mocks.download).toHaveBeenCalledOnce());
      expect(exportButton()).toBeEnabled();
    },
  );
});
