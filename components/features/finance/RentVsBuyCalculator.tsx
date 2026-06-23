'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import { Card } from '@/components/ui';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

type Result = {
  rentTotalCost: number;
  buyTotalCost: number;
  buyMonthlyCost: number;
  netSavings: number;
  recommendation: string;
  yearByYear: Array<{
    year: number;
    rentCumulative: number;
    buyCumulative: number;
    equity: number;
  }>;
};

function calculateRentVsBuy(params: {
  homePrice: number;
  downPayment: number;
  loanAmount: number;
  loanRate: number;
  loanYears: number;
  monthlyRent: number;
  rentIncreaseRate: number;
  years: number;
}): Result {
  const {
    homePrice,
    downPayment,
    loanAmount,
    loanRate,
    loanYears,
    monthlyRent,
    rentIncreaseRate,
    years,
  } = params;

  const monthlyLoanRate = loanRate / 100 / 12;
  const totalLoanMonths = loanYears * 12;
  const monthlyPayment =
    monthlyLoanRate > 0
      ? (loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, totalLoanMonths)) /
        (Math.pow(1 + monthlyLoanRate, totalLoanMonths) - 1)
      : loanAmount / totalLoanMonths;

  let rentCumulative = 0;
  let buyCumulative = downPayment;
  let currentRent = monthlyRent;
  let remainingLoan = loanAmount;
  const yearByYear: Result['yearByYear'] = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      if (m === 0 && y > 1) {
        currentRent *= 1 + rentIncreaseRate / 100;
      }
      rentCumulative += currentRent;

      if (y <= loanYears) {
        const interestPayment = remainingLoan * monthlyLoanRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingLoan -= principalPayment;
        buyCumulative += monthlyPayment;
      }
    }

    const equity = homePrice * Math.pow(1.05, y) - Math.max(remainingLoan, 0);
    yearByYear.push({
      year: y,
      rentCumulative: Math.round(rentCumulative),
      buyCumulative: Math.round(buyCumulative),
      equity: Math.round(equity),
    });
  }

  const rentTotalCost = Math.round(rentCumulative);
  const buyTotalCost = Math.round(buyCumulative);
  const netSavings = rentTotalCost - buyTotalCost;
  const recommendation =
    netSavings > 0
      ? 'خرید مسکن در این بازه زمانی مقرون‌به‌صرفه‌تر است.'
      : 'اجاره در این بازه زمانی مقرون‌به‌صرفه‌تر است.';

  return {
    rentTotalCost,
    buyTotalCost,
    buyMonthlyCost: Math.round(monthlyPayment),
    netSavings: Math.abs(netSavings),
    recommendation,
    yearByYear,
  };
}

export default function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState<string>('5000000000');
  const [downPayment, setDownPayment] = useState<string>('1000000000');
  const [loanRate, setLoanRate] = useState<string>('24');
  const [loanYears, setLoanYears] = useState<string>('20');
  const [monthlyRent, setMonthlyRent] = useState<string>('30000000');
  const [rentIncrease, setRentIncrease] = useState<string>('15');
  const [years, setYears] = useState<string>('10');
  const [result, setResult] = useState<Result | null>(null);

  const calculate = useCallback(() => {
    const hp = parseFloat(homePrice);
    const dp = parseFloat(downPayment);
    const lr = parseFloat(loanRate);
    const ly = parseInt(loanYears);
    const mr = parseFloat(monthlyRent);
    const ri = parseFloat(rentIncrease);
    const y = parseInt(years);
    if (isNaN(hp) || isNaN(dp) || hp <= 0 || dp <= 0) {
      return;
    }

    setResult(
      calculateRentVsBuy({
        homePrice: hp,
        downPayment: dp,
        loanAmount: hp - dp,
        loanRate: lr,
        loanYears: ly,
        monthlyRent: mr,
        rentIncreaseRate: ri,
        years: y,
      }),
    );
  }, [homePrice, downPayment, loanRate, loanYears, monthlyRent, rentIncrease, years]);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">مقایسه اجاره و خرید مسکن</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'قیمت ملک (تومان)', value: homePrice, set: setHomePrice },
            { label: 'پیش‌پرداخت (تومان)', value: downPayment, set: setDownPayment },
            { label: 'نرخ سود وام سالانه (%)', value: loanRate, set: setLoanRate },
            { label: 'مدت وام (سال)', value: loanYears, set: setLoanYears },
            { label: 'اجاره ماهانه فعلی (تومان)', value: monthlyRent, set: setMonthlyRent },
            { label: 'نرخ افزایش اجاره سالانه (%)', value: rentIncrease, set: setRentIncrease },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {item.label}
              </label>
              <input
                type="number"
                value={item.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => item.set(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] text-sm"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              مدت مقایسه (سال)
            </label>
            <input
              type="number"
              value={years}
              min="1"
              max="30"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setYears(e.target.value)}
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
              <div className="p-4 rounded-lg text-center bg-[rgb(var(--color-info-rgb)/0.1)]">
                <p className="text-xs text-[var(--text-muted)]">هزینه اجاره کل</p>
                <p className="text-lg font-bold text-[var(--color-info)]">
                  {formatMoney(result.rentTotalCost)}
                </p>
              </div>
              <div className="p-4 rounded-lg text-center bg-[rgb(var(--color-success-rgb)/0.1)]">
                <p className="text-xs text-[var(--text-muted)]">هزینه خرید کل</p>
                <p className="text-lg font-bold text-[var(--color-success)]">
                  {formatMoney(result.buyTotalCost)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  قسط ماهانه: {formatMoney(result.buyMonthlyCost)}
                </p>
              </div>
              <div className="p-4 rounded-lg text-center bg-[rgb(var(--color-primary-rgb)/0.1)]">
                <p className="text-xs text-[var(--text-muted)]">صرفه‌جویی</p>
                <p className="text-lg font-bold text-[var(--color-primary)]">
                  {formatMoney(result.netSavings)} تومان
                </p>
              </div>
            </div>
          </Card>

          {result.yearByYear.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold text-[var(--text-primary)] mb-3">مقایسه سالانه</h3>
              <div className="space-y-2">
                {result.yearByYear.map((item) => (
                  <div key={item.year} className="grid grid-cols-4 gap-2 text-sm">
                    <span className="text-[var(--text-muted)]">سال {item.year}</span>
                    <span className="text-[var(--color-info)] font-mono">
                      اجاره: {formatMoney(item.rentCumulative)}
                    </span>
                    <span className="text-[var(--color-success)] font-mono">
                      خرید: {formatMoney(item.buyCumulative)}
                    </span>
                    <span className="text-[var(--color-info)] font-mono">
                      دارایی: {formatMoney(item.equity)}
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
