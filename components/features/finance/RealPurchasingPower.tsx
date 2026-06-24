'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';

type Result = {
  realSalary: number;
  purchasingPower: number;
  yearlyLoss: number;
  breakEvenRaise: number;
  history: Array<{ year: number; nominal: number; real: number }>;
};

function calculateRealPurchasingPower(
  monthlySalary: number,
  annualInflation: number,
  years: number,
): Result {
  const rate = annualInflation / 100;
  let currentReal = monthlySalary;
  const history: Array<{ year: number; nominal: number; real: number }> = [];

  for (let y = 1; y <= years; y++) {
    const nominalSalary = monthlySalary * Math.pow(1.1, y - 1);
    currentReal = monthlySalary / Math.pow(1 + rate, y);
    history.push({
      year: y,
      nominal: Math.round(nominalSalary),
      real: Math.round(currentReal),
    });
  }

  const purchasingPower = (currentReal / monthlySalary) * 100;
  const yearlyLoss = monthlySalary - currentReal;
  const breakEvenRaise = (Math.pow(1 + rate, 1) - 1) * 100;

  return {
    realSalary: Math.round(currentReal),
    purchasingPower: Math.round(purchasingPower * 10) / 10,
    yearlyLoss: Math.round(yearlyLoss),
    breakEvenRaise: Math.round(breakEvenRaise * 10) / 10,
    history,
  };
}

export default function RealPurchasingPowerPage() {
  const [salary, setSalary] = useState<string>('10000000');
  const [inflation, setInflation] = useState<string>('40');
  const [years, setYears] = useState<string>('5');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = useCallback(() => {
    const s = parseFloat(salary);
    const i = parseFloat(inflation);
    const y = parseInt(years);
    if (isNaN(s) || isNaN(i) || isNaN(y) || s <= 0) {
      return;
    }
    setResult(calculateRealPurchasingPower(s, i, y));
  }, [salary, inflation, years]);

  return (
    <div className="space-y-8">
      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">محاسبه قدرت خرید واقعی</h2>
        <p className="text-sm text-[var(--text-muted)]">
          ببینید حقوق شما بعد از تورم چقدر ارزش واقعی دارد و برای حفظ قدرت خرید به چه افزایش حقوقی
          نیاز دارید.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              حقوق ماهانه (تومان)
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSalary(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              نرخ تورم سالانه (%)
            </label>
            <input
              type="number"
              value={inflation}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInflation(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              مدت زمان (سال)
            </label>
            <input
              type="number"
              value={years}
              min="1"
              max="30"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setYears(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={calculate}
          className="w-full py-3 px-6 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded-lg font-semibold hover:opacity-90 transition"
        >
          محاسبه کن
        </button>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">ارزش واقعی حقوق</p>
              <p className="text-2xl font-bold text-[var(--color-danger)] mt-2">
                {formatMoneyFa(result.realSalary)} تومان
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">معادل خرید امروز</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">قدرت خرید باقی‌مانده</p>
              <p className="text-2xl font-bold text-[var(--color-warning)] mt-2">
                %{result.purchasingPower}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">از قدرت خرید فعلی</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">افزایش حقوق برای حفظ ارزش</p>
              <p className="text-2xl font-bold text-[var(--color-success)] mt-2">
                %{result.breakEvenRaise}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">سالانه</p>
            </Card>
          </div>

          {result.history.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                مقایسه حقوق اسمی و واقعی
              </h3>
              <div className="space-y-3">
                {result.history.map((item) => (
                  <div key={item.year} className="flex items-center gap-4">
                    <span className="w-16 text-sm text-[var(--text-muted)]">سال {item.year}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-[var(--color-info)] w-16">اسمی</div>
                        <div className="flex-1 bg-[var(--color-info)]/10 rounded-full h-4">
                          <div
                            className="bg-[var(--color-info)] h-4 rounded-full"
                            style={{
                              width: `${(item.nominal / result.history[0]!.nominal / Math.pow(1.1, result.history.length - 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[var(--text-primary)] w-24 text-left">
                          {formatMoneyFa(item.nominal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-[var(--color-danger)] w-16">واقعی</div>
                        <div className="flex-1 bg-[var(--color-danger)]/10 rounded-full h-4">
                          <div
                            className="bg-[var(--color-danger)] h-4 rounded-full"
                            style={{
                              width: `${(item.real / result.history[0]!.nominal / Math.pow(1.1, result.history.length - 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[var(--text-primary)] w-24 text-left">
                          {formatMoneyFa(item.real)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
