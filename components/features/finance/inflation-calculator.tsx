'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

export default function InflationCalculatorPage() {
  const [amount, setAmount] = useState<string>('1000000');
  const [years, setYears] = useState<string>('5');
  const [inflationRate, setInflationRate] = useState<string>('40');
  const [result, setResult] = useState<{
    futureValue: number;
    lostValue: number;
    percentageLost: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const calculate = useCallback(async () => {
    const numAmount = parseFloat(amount);
    const numYears = parseInt(years);
    const numRate = parseFloat(inflationRate);

    if (isNaN(numAmount) || isNaN(numYears) || isNaN(numRate)) {
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const futureValue = numAmount / Math.pow(1 + numRate / 100, numYears);
      const lostValue = numAmount - futureValue;
      const percentageLost = (lostValue / numAmount) * 100;

      setResult({ futureValue, lostValue, percentageLost });
    } finally {
      setProcessing(false);
    }
  }, [amount, years, inflationRate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">محاسبه‌گر تورم</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="مبلغ (تومان)"
              type="number"
              min="0"
              value={amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setAmount(e.target.value);
                setResult(null);
              }}
            />

            <Input
              label="مدت (سال)"
              type="number"
              min="1"
              max="30"
              value={years}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setYears(e.target.value);
                setResult(null);
              }}
            />

            <Input
              label="نرخ تورم سالانه (%)"
              type="number"
              min="0"
              max="100"
              value={inflationRate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setInflationRate(e.target.value);
                setResult(null);
              }}
            />
          </div>

          <Button onClick={calculate} disabled={processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'محاسبه کن'}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-sm text-[var(--text-secondary)]">ارزش آینده</p>
                  <p className="text-xl font-bold text-red-600">
                    {result.futureValue.toLocaleString('fa-IR')} تومان
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                  <p className="text-sm text-[var(--text-secondary)]">ارزش از دست رفته</p>
                  <p className="text-xl font-bold text-orange-600">
                    {result.lostValue.toLocaleString('fa-IR')} تومان
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-[var(--text-secondary)]">درصد کاهش ارزش</p>
                  <p className="text-xl font-bold text-yellow-600">
                    %{result.percentageLost.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
