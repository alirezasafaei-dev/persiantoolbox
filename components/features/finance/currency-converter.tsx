'use client';

import { useState, useCallback, useEffect, useMemo, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { useMarketData } from '@/shared/hooks/useMarketData';

const FALLBACK_CURRENCIES = [
  { code: 'USD', name: 'دلار آمریکا', rate: 1, change24h: 0 },
  { code: 'EUR', name: 'یورو', rate: 0.92, change24h: 0 },
  { code: 'GBP', name: 'پوند انگلیس', rate: 0.79, change24h: 0 },
  { code: 'AED', name: 'درهم امارات', rate: 3.67, change24h: 0 },
  { code: 'TRY', name: 'لیر ترکیه', rate: 32.5, change24h: 0 },
  { code: 'IRR', name: 'تومان ایران', rate: 4200, change24h: 0 },
];

function getFreshnessClass(freshness: string) {
  switch (freshness) {
    case 'live':
      return 'bg-[var(--color-success)]';
    case 'cached':
      return 'bg-[var(--color-warning)]';
    default:
      return 'bg-[var(--color-danger)]';
  }
}

function getFreshnessLabel(freshness: string) {
  switch (freshness) {
    case 'live':
      return 'زنده';
    case 'cached':
      return 'کش شده';
    default:
      return 'قدیمی';
  }
}

export default function CurrencyConverterPage() {
  const { data: marketData, error: marketError, refresh } = useMarketData();
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('IRR');
  const [result, setResult] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const currencies = useMemo(
    () => (marketData ? Object.values(marketData.currencies) : FALLBACK_CURRENCIES),
    [marketData],
  );

  const convert = useCallback(async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate ?? 1;
      const toRate = currencies.find((c) => c.code === toCurrency)?.rate ?? 1;
      let converted = (numAmount / fromRate) * toRate;
      if (toCurrency === 'IRR') {
        converted = Math.round(converted / 10);
      }
      setResult(converted);
    } finally {
      setProcessing(false);
    }
  }, [amount, fromCurrency, toCurrency, currencies]);

  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  }, [fromCurrency, toCurrency]);

  // Auto-convert when data loads
  useEffect(() => {
    if (marketData && amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate ?? 1;
        const toRate = currencies.find((c) => c.code === toCurrency)?.rate ?? 1;
        let converted = (numAmount / fromRate) * toRate;
        if (toCurrency === 'IRR') {
          converted = Math.round(converted / 10);
        }
        setResult(converted);
      }
    }
  }, [marketData, amount, fromCurrency, toCurrency, currencies]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">مبدل ارز</h2>
            {marketData ? (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span
                  className={`w-2 h-2 rounded-full ${getFreshnessClass(marketData.freshness)}`}
                />
                <span>{getFreshnessLabel(marketData.freshness)}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  بروزرسانی
                </button>
              </div>
            ) : null}
          </div>

          {marketError ? (
            <div className="p-3 rounded-lg text-sm bg-[rgb(var(--color-danger-rgb)/0.1)] text-[var(--color-danger)]">
              خطا در دریافت نرخ ارز: {marketError}
            </div>
          ) : null}

          <Input
            label="مبلغ"
            type="number"
            min="0"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setAmount(e.target.value);
              setResult(null);
            }}
            placeholder="مبلغ را وارد کنید"
          />

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">از</label>
              <select
                value={fromCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setFromCurrency(e.target.value);
                  setResult(null);
                }}
                aria-label="ارز مبدأ"
                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <Button variant="secondary" onClick={swapCurrencies} aria-label="جابجایی ارزها">
              ↔
            </Button>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">به</label>
              <select
                value={toCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setToCurrency(e.target.value);
                  setResult(null);
                }}
                aria-label="ارز مقصد"
                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={convert} disabled={processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'تبدیل کن'}
          </Button>

          {result !== null && (
            <div className="p-4 rounded-lg bg-[rgb(var(--color-info-rgb)/0.1)]">
              <p className="text-lg font-semibold text-center text-[var(--text-primary)]">
                {parseFloat(amount).toLocaleString('fa-IR')} {fromCurrency} ={' '}
                {result.toLocaleString('fa-IR')} {toCurrency}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
