'use client';

import { useState, useCallback, useMemo } from 'react';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

type InvestmentType = 'savings' | 'gold' | 'dollar';

interface SimulationResult {
  initialAmount: number;
  finalAmount: number;
  returnRate: number;
  totalReturn: number;
  months: number;
}

const INVESTMENT_TYPES: Record<
  InvestmentType,
  { name: string; annualRate: number; description: string }
> = {
  savings: {
    name: 'سپرده بانکی',
    annualRate: 23,
    description: 'نرخ سود سپرده کوتاه‌مدت بانکی',
  },
  gold: {
    name: 'طلا',
    annualRate: 15,
    description: 'بازده تقریبی سالانه طلا (تاریخی)',
  },
  dollar: {
    name: 'دلار',
    annualRate: 12,
    description: 'بازده تقریبی سالانه دلار (تاریخی)',
  },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

export default function InvestmentSimulator() {
  const [amount, setAmount] = useState('10000000');
  const [months, setMonths] = useState('12');
  const [investmentType, setInvestmentType] = useState<InvestmentType>('savings');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulate = useCallback(() => {
    const numAmount = parseFloat(amount);
    const numMonths = parseInt(months, 10);

    if (isNaN(numAmount) || numAmount <= 0 || isNaN(numMonths) || numMonths <= 0) {
      return;
    }

    const config = INVESTMENT_TYPES[investmentType];
    const monthlyRate = config.annualRate / 100 / 12;
    const finalAmount = numAmount * Math.pow(1 + monthlyRate, numMonths);
    const totalReturn = finalAmount - numAmount;
    const returnRate = (totalReturn / numAmount) * 100;

    setResult({
      initialAmount: numAmount,
      finalAmount,
      returnRate,
      totalReturn,
      months: numMonths,
    });
  }, [amount, months, investmentType]);

  const monthlyData = useMemo(() => {
    if (!result) {
      return [];
    }

    const numAmount = result.initialAmount;
    const numMonths = result.months;
    const monthlyRate = INVESTMENT_TYPES[investmentType].annualRate / 100 / 12;

    const data = [];
    for (let i = 0; i <= numMonths; i++) {
      const value = numAmount * Math.pow(1 + monthlyRate, i);
      data.push({ month: i, value });
    }
    return data;
  }, [result, investmentType]);

  const maxValue = useMemo(() => {
    if (monthlyData.length === 0) {
      return 0;
    }
    return Math.max(...monthlyData.map((d) => d.value));
  }, [monthlyData]);

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)]">شبیه‌ساز بازده سرمایه‌گذاری</h3>
      <p className="text-sm text-[var(--text-muted)]">
        بازده تقریبی سرمایه‌گذاری خود را در بازه زمانی مختلف محاسبه کنید.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="مبلغ سرمایه‌گذاری (تومان)"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مبلغ را وارد کنید"
        />

        <Input
          label="مدت (ماه)"
          type="number"
          min="1"
          max="120"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="تعداد ماه"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            نوع سرمایه‌گذاری
          </label>
          <select
            value={investmentType}
            onChange={(e) => setInvestmentType(e.target.value as InvestmentType)}
            aria-label="نوع سرمایه‌گذاری"
            className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
          >
            {Object.entries(INVESTMENT_TYPES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name} ({config.annualRate}% سالانه)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {INVESTMENT_TYPES[investmentType].description}
      </div>

      <Button onClick={simulate} fullWidth>
        محاسبه کن
      </Button>

      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--surface-2)] rounded-lg text-center">
              <div className="text-xs text-[var(--text-muted)]">مبلغ اولیه</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {formatMoney(result.initialAmount)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">تومان</div>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded-lg text-center">
              <div className="text-xs text-[var(--text-muted)]">مبلغ نهایی</div>
              <div className="text-lg font-bold text-green-500">
                {formatMoney(result.finalAmount)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">تومان</div>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded-lg text-center">
              <div className="text-xs text-[var(--text-muted)]">بازده کل</div>
              <div className="text-lg font-bold text-green-500">
                {formatMoney(result.totalReturn)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">تومان</div>
            </div>
            <div className="p-4 bg-[var(--surface-2)] rounded-lg text-center">
              <div className="text-xs text-[var(--text-muted)]">نرخ بازده</div>
              <div className="text-lg font-bold text-[var(--color-primary)]">
                %{result.returnRate.toFixed(2)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">{result.months} ماهه</div>
            </div>
          </div>

          {/* Simple bar chart */}
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-3">
              نمودار رشد سرمایه
            </div>
            <div className="flex items-end gap-1 h-32">
              {monthlyData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[var(--color-primary)] rounded-t"
                  style={{
                    height: `${(d.value / maxValue) * 100}%`,
                    opacity: 0.3 + (i / monthlyData.length) * 0.7,
                  }}
                  title={`${d.month} ماه: ${formatMoney(d.value)} تومان`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
              <span>ماه ۰</span>
              <span>ماه {result.months}</span>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] text-center">
            ⚠️ این محاسبات بر اساس نرخ‌های تقریبی تاریخی است و تضمینی برای بازده آینده نیست.
          </div>
        </div>
      ) : null}
    </Card>
  );
}
