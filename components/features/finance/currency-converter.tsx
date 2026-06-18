'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

const currencies = [
  { code: 'USD', name: 'دلار آمریکا', rate: 1 },
  { code: 'EUR', name: 'یورو', rate: 0.92 },
  { code: 'GBP', name: 'پوند انگلیس', rate: 0.79 },
  { code: 'AED', name: 'درهم امارات', rate: 3.67 },
  { code: 'TRY', name: 'لیر ترکیه', rate: 32.5 },
  { code: 'IRR', name: 'تومان ایران', rate: 42000 },
];

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('IRR');
  const [result, setResult] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const convert = useCallback(async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate ?? 1;
      const toRate = currencies.find((c) => c.code === toCurrency)?.rate ?? 1;
      const converted = (numAmount / fromRate) * toRate;
      setResult(converted);
    } finally {
      setProcessing(false);
    }
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  }, [fromCurrency, toCurrency]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            مبدل ارز
          </h2>

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
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                از
              </label>
              <select
                value={fromCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setFromCurrency(e.target.value);
                  setResult(null);
                }}
                className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <Button variant="secondary" onClick={swapCurrencies}>
              ↔
            </Button>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                به
              </label>
              <select
                value={toCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setToCurrency(e.target.value);
                  setResult(null);
                }}
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
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
