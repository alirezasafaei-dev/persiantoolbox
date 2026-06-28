'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

export default function InvestmentCalculatorPage() {
  const [principal, setPrincipal] = useState<string>('10000000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('1000000');
  const [years, setYears] = useState<string>('5');
  const [annualReturn, setAnnualReturn] = useState<string>('20');
  const [result, setResult] = useState<{
    totalInvested: number;
    totalValue: number;
    totalReturn: number;
    yearlyData: Array<{ year: number; value: number }>;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const calculate = useCallback(async () => {
    const numPrincipal = parseFloat(principal);
    const numMonthly = parseFloat(monthlyContribution);
    const numYears = parseInt(years);
    const numReturn = parseFloat(annualReturn);

    if (isNaN(numPrincipal) || isNaN(numMonthly) || isNaN(numYears) || isNaN(numReturn)) {
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const monthlyRate = numReturn / 100 / 12;
      const totalMonths = numYears * 12;
      let currentValue = numPrincipal;
      const yearlyData: Array<{ year: number; value: number }> = [];

      for (let month = 1; month <= totalMonths; month++) {
        currentValue = (currentValue + numMonthly) * (1 + monthlyRate);
        if (month % 12 === 0) {
          yearlyData.push({ year: month / 12, value: currentValue });
        }
      }

      const totalInvested = numPrincipal + numMonthly * totalMonths;
      const totalValue = currentValue;
      const totalReturn = totalValue - totalInvested;

      setResult({ totalInvested, totalValue, totalReturn, yearlyData });
    } finally {
      setProcessing(false);
    }
  }, [principal, monthlyContribution, years, annualReturn]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">محاسبه‌گر سرمایه‌گذاری</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="مبلغ اولیه (تومان)"
              type="number"
              min="0"
              value={principal}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPrincipal(e.target.value);
                setResult(null);
              }}
            />

            <Input
              label="پس‌انداز ماهانه (تومان)"
              type="number"
              min="0"
              value={monthlyContribution}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setMonthlyContribution(e.target.value);
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
              label="بازده سالانه (%)"
              type="number"
              min="0"
              max="100"
              value={annualReturn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setAnnualReturn(e.target.value);
                setResult(null);
              }}
            />
          </div>

          <Button onClick={calculate} disabled={processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'محاسبه کن'}
          </Button>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg text-center bg-[rgb(var(--color-info-rgb)/0.1)]">
                  <p className="text-sm text-[var(--text-secondary)]">مبلغ سرمایه‌گذاری شده</p>
                  <p className="text-xl font-bold text-[var(--color-info)]">
                    {result.totalInvested.toLocaleString('fa-IR')} تومان
                  </p>
                </div>

                <div className="p-4 rounded-lg text-center bg-[rgb(var(--color-success-rgb)/0.1)]">
                  <p className="text-sm text-[var(--text-secondary)]">ارزش نهایی</p>
                  <p className="text-xl font-bold text-[var(--color-success)]">
                    {result.totalValue.toLocaleString('fa-IR')} تومان
                  </p>
                </div>

                <div className="p-4 rounded-lg text-center bg-[rgb(var(--color-primary-rgb)/0.1)]">
                  <p className="text-sm text-[var(--text-secondary)]">بازده خالص</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">
                    {result.totalReturn.toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>

              {result.yearlyData.length > 0 && (
                <div className="p-4 border border-[var(--border-light)] rounded-lg">
                  <h4 className="font-semibold mb-3 text-[var(--text-primary)]">
                    رشد سرمایه بر اساس سال
                  </h4>
                  <div className="space-y-2">
                    {result.yearlyData.map((item) => (
                      <div key={item.year} className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">سال {item.year}</span>
                        <span className="font-mono text-[var(--text-primary)]">
                          {item.value.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
