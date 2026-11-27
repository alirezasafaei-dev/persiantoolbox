import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import MarketDashboard from '@/components/features/market/MarketDashboard';

const scenario = vi.hoisted(() => ({ unavailable: false }));

it('calculates rial equivalents from user-supplied dollar prices during an outage', () => {
  scenario.unavailable = true;
  try {
    render(<MarketDashboard />);
    fireEvent.change(screen.getByLabelText('نرخ هر دلار (ریال)'), {
      target: { value: '۱٬۰۰۰٬۰۰۰' },
    });
    fireEvent.change(screen.getByLabelText('قیمت اونس تروا طلا (دلار)'), {
      target: { value: '۳۱۱۰٫۳۴۷۶۸' },
    });
    fireEvent.change(screen.getByLabelText('قیمت بیت‌کوین (دلار)'), { target: { value: '۶۰۰۰۰' } });
    fireEvent.change(screen.getByLabelText('قیمت اتریوم (دلار)'), { target: { value: '۲۰۰۰' } });
    const result = screen.getByRole('status', { name: 'نتیجهٔ تبدیل به ریال' });
    expect(result).toHaveTextContent('۱۰۰٬۰۰۰٬۰۰۰ ریال');
    expect(result).toHaveTextContent('۷۵٬۰۰۰٬۰۰۰ ریال');
    expect(result).toHaveTextContent('۶۰٬۰۰۰٬۰۰۰٬۰۰۰ ریال');
    expect(result).toHaveTextContent('۲٬۰۰۰٬۰۰۰٬۰۰۰ ریال');
    fireEvent.change(screen.getByLabelText('نرخ هر دلار (ریال)'), { target: { value: '0' } });
    expect(result).not.toHaveTextContent('۷۵٬۰۰۰٬۰۰۰ ریال');
  } finally {
    scenario.unavailable = false;
  }
});

vi.mock('@/shared/hooks/useMarketData', () => ({
  useMarketData: () => ({
    loading: false,
    error: scenario.unavailable ? 'Failed to fetch market data' : null,
    refresh: vi.fn(),
    data: scenario.unavailable
      ? null
      : {
          timestamp: 1,
          freshness: 'cached',
          currencies: { EUR: { code: 'EUR', name: 'یورو', rate: 0.92, change24h: 0 } },
          gold: { pricePerGram: 4051000, change24h: 0 },
          crypto: {},
          sources: [],
        },
  }),
}));

it('keeps the heading and local simulator usable when quote sources are unavailable', () => {
  scenario.unavailable = true;
  try {
    render(<MarketDashboard />);
    expect(screen.getByRole('heading', { level: 1, name: 'داشبورد بازار' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'تلاش مجدد' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /سرمایه‌گذاری میان‌مدت طلا/ }));
    fireEvent.click(screen.getByRole('button', { name: 'اعمال در شبیه‌ساز' }));
    expect(screen.getByLabelText('نوع سرمایه‌گذاری')).toHaveValue('gold');
    expect(screen.queryByText('Failed to fetch market data')).not.toBeInTheDocument();
  } finally {
    scenario.unavailable = false;
  }
});

it('displays fractional reference rates and the actual gold unit without invented FX changes', () => {
  render(<MarketDashboard />);
  expect(screen.getByText('۰٫۹۲')).toBeInTheDocument();
  expect(screen.getByText('۴٬۰۵۱٬۰۰۰ ریال')).toBeInTheDocument();
  expect(screen.queryByText('+0.00%')).not.toBeInTheDocument();
  expect(screen.getByText(/نرخ‌های مرجع ارز به‌ازای یک دلار آمریکا/)).toBeInTheDocument();
});

it('applies a preset and reapplies its saved copy without navigating away', () => {
  const storageKey = 'persian-toolbox-market-scenarios';
  localStorage.removeItem(storageKey);
  try {
    render(<MarketDashboard />);
    const url = window.location.href;
    fireEvent.click(screen.getByRole('button', { name: /سرمایه‌گذاری میان‌مدت طلا/ }));
    fireEvent.click(screen.getByRole('button', { name: 'اعمال در شبیه‌ساز' }));
    expect(screen.getByLabelText('مبلغ سرمایه‌گذاری (تومان)')).toHaveValue(100000000);
    expect(screen.getByLabelText('مدت (ماه)')).toHaveValue(12);
    expect(screen.getByLabelText('نوع سرمایه‌گذاری')).toHaveValue('gold');
    fireEvent.click(screen.getByRole('button', { name: /^ذخیره$/ }));
    fireEvent.change(screen.getByLabelText('مدت (ماه)'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: /^اعمال$/ }));
    expect(screen.getByLabelText('مدت (ماه)')).toHaveValue(12);
    expect(window.location.href).toBe(url);
  } finally {
    localStorage.removeItem(storageKey);
  }
});
