'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

type Result = {
  loanTotalCost: number;
  investmentReturn: number;
  netBenefit: number;
  recommendation: string;
  monthlyBreakdown: Array<{
    month: number;
    loanBalance: number;
    investmentValue: number;
  }>;
};

function calculateLoanVsInvestment(params: {
  loanAmount: number;
  loanRate: number;
  loanYears: number;
  investmentReturn: number;
  investmentYears: number;
}): Result {
  const { loanAmount, loanRate, loanYears, investmentReturn, investmentYears } = params;

  const monthlyLoanRate = loanRate / 100 / 12;
  const monthlyInvestRate = investmentReturn / 100 / 12;
  const totalLoanMonths = loanYears * 12;
  const totalInvestMonths = investmentYears * 12;

  const monthlyPayment =
    monthlyLoanRate > 0
      ? (loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, totalLoanMonths)) /
        (Math.pow(1 + monthlyLoanRate, totalLoanMonths) - 1)
      : loanAmount / totalLoanMonths;

  const totalLoanPaid = monthlyPayment * totalLoanMonths;
  const loanTotalCost = totalLoanPaid - loanAmount;

  let investmentValue = loanAmount;
  const monthlyBreakdown: Result['monthlyBreakdown'] = [];
  const maxMonths = Math.max(totalLoanMonths, totalInvestMonths);

  for (let m = 1; m <= maxMonths; m++) {
    if (m <= totalInvestMonths) {
      investmentValue = investmentValue * (1 + monthlyInvestRate);
    }
    const loanBalance =
      m <= totalLoanMonths
        ? loanAmount * Math.pow(1 + monthlyLoanRate, m) -
          monthlyPayment * ((Math.pow(1 + monthlyLoanRate, m) - 1) / monthlyLoanRate)
        : 0;

    if (m % 12 === 0) {
      monthlyBreakdown.push({
        month: m,
        loanBalance: Math.max(0, loanBalance),
        investmentValue: Math.round(investmentValue),
      });
    }
  }

  const investmentReturnAmount = Math.round(investmentValue - loanAmount);
  const netBenefit = investmentReturnAmount - loanTotalCost;
  const recommendation =
    netBenefit > 0
      ? 'سرمایه‌گذاری با وام منطقی است (بازده سرمایه‌گذاری بیشتر از هزینه وام است).'
      : 'سرمایه‌گذاری با وام منطقی نیست (هزینه وام بیشتر از بازده سرمایه‌گذاری است).';

  return {
    loanTotalCost: Math.round(loanTotalCost),
    investmentReturn: investmentReturnAmount,
    netBenefit: Math.abs(netBenefit),
    recommendation,
    monthlyBreakdown,
  };
}

export default function LoanVsInvestmentCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('1000000000');
  const [loanRate, setLoanRate] = useState<string>('24');
  const [loanYears, setLoanYears] = useState<string>('5');
  const [investReturn, setInvestReturn] = useState<string>('30');
  const [investYears, setInvestYears] = useState<string>('5');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = useCallback(() => {
    const la = parseFloat(loanAmount);
    const lr = parseFloat(loanRate);
    const ly = parseInt(loanYears);
    const ir = parseFloat(investReturn);
    const iy = parseInt(investYears);
    if (isNaN(la) || la <= 0) {
      return;
    }
    setResult(
      calculateLoanVsInvestment({
        loanAmount: la,
        loanRate: lr,
        loanYears: ly,
        investmentReturn: ir,
        investmentYears: iy,
      }),
    );
  }, [loanAmount, loanRate, loanYears, investReturn, investYears]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          مقایسه وام با سرمایه‌گذاری
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          آیا گرفتن وام و سرمایه‌گذاری آن منطقی است؟ هزینه وام را با بازده سرمایه‌گذاری مقایسه کنید.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              مبلغ وام (تومان)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              نرخ سود وام سالانه (%)
            </label>
            <input
              type="number"
              value={loanRate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanRate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              مدت وام (سال)
            </label>
            <input
              type="number"
              value={loanYears}
              min="1"
              max="30"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanYears(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              بازده سرمایه‌گذاری سالانه (%)
            </label>
            <input
              type="number"
              value={investReturn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInvestReturn(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              مدت سرمایه‌گذاری (سال)
            </label>
            <input
              type="number"
              value={investYears}
              min="1"
              max="30"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInvestYears(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full py-3 px-6 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded-lg font-semibold hover:opacity-90 transition"
        >
          مقایسه کن
        </button>
      </Card>

      {result && (
        <>
          <Card className="p-6">
            <div className="text-center mb-4">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {result.recommendation}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <p className="text-xs text-[var(--text-muted)]">هزینه خالص وام</p>
                <p className="text-lg font-bold text-red-600">
                  {formatMoney(result.loanTotalCost)} تومان
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-xs text-[var(--text-muted)]">بازده سرمایه‌گذاری</p>
                <p className="text-lg font-bold text-green-600">
                  {formatMoney(result.investmentReturn)} تومان
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <p className="text-xs text-[var(--text-muted)]">سود خالص</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatMoney(result.netBenefit)} تومان
                </p>
              </div>
            </div>
          </Card>

          {result.monthlyBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-3">رشد سالانه</h3>
              <div className="space-y-2">
                {result.monthlyBreakdown.map((item) => (
                  <div key={item.month} className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-[var(--text-muted)]">سال {item.month / 12}</span>
                    <span className="text-red-600 font-mono">
                      مانده وام: {formatMoney(item.loanBalance)}
                    </span>
                    <span className="text-green-600 font-mono">
                      ارزش سرمایه: {formatMoney(item.investmentValue)}
                    </span>
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
