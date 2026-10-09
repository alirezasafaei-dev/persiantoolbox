import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CurrencyConverter from '@/components/features/finance/currency-converter';
import InflationCalculator from '@/components/features/finance/inflation-calculator';
import RetirementCalculator from '@/components/features/finance/RetirementCalculator';

vi.mock('@/shared/hooks/useMarketData', () => ({
  useMarketData: () => ({ data: null, error: null, refresh: () => {} }),
}));
vi.mock('@/shared/ui/SaveScenarioButton', () => ({ default: () => null }));

describe('calculator headings in standalone and embedded contexts', () => {
  it.each([CurrencyConverter, InflationCalculator, RetirementCalculator])(
    'retains its embedded heading but suppresses it when the route supplies an H1',
    (Calculator) => {
      const embedded = new DOMParser().parseFromString(
        renderToStaticMarkup(<Calculator />),
        'text/html',
      );
      const standalone = new DOMParser().parseFromString(
        renderToStaticMarkup(<Calculator {...{ showTitle: false }} />),
        'text/html',
      );
      expect(embedded.querySelectorAll('h2')).toHaveLength(1);
      expect(standalone.querySelectorAll('h2')).toHaveLength(0);
    },
  );
});
