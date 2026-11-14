import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import MarketDashboard from '@/components/features/market/MarketDashboard';

vi.mock('@/shared/hooks/useMarketData', () => ({
  useMarketData: () => ({
    loading: false,
    error: null,
    refresh: vi.fn(),
    data: {
      timestamp: 1,
      freshness: 'cached',
      currencies: { EUR: { code: 'EUR', name: 'یورو', rate: 0.92, change24h: 0 } },
      gold: { pricePerGram: 4051000, change24h: 0 },
      crypto: {},
      sources: [],
    },
  }),
}));

it('displays fractional reference rates and the actual gold unit without invented FX changes', () => {
  render(<MarketDashboard />);
  expect(screen.getByText('۰٫۹۲')).toBeInTheDocument();
  expect(screen.getByText('۴٬۰۵۱٬۰۰۰ ریال')).toBeInTheDocument();
  expect(screen.queryByText('+0.00%')).not.toBeInTheDocument();
  expect(screen.getByText(/نرخ‌های مرجع ارز به‌ازای یک دلار آمریکا/)).toBeInTheDocument();
});
