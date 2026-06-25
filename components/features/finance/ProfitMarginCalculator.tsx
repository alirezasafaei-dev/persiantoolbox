'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';

type ProfitResult = {
  costPrice: number;
  sellingPrice: number;
  profit: number;
  grossMargin: number;
  markup: number;
  breakEven: number;
};

function calculateProfit(costPrice: number, sellingPrice: number): ProfitResult | null {
  if (costPrice <= 0 || sellingPrice <= 0) {
    return null;
  }
  const profit = sellingPrice - costPrice;
  const grossMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markup = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  const breakEven = costPrice;
  return { costPrice, sellingPrice, profit, grossMargin, markup, breakEven };
}

function calculateFromMargin(costPrice: number, desiredMargin: number): ProfitResult | null {
  if (costPrice <= 0 || desiredMargin <= 0 || desiredMargin >= 100) {
    return null;
  }
  const sellingPrice = costPrice / (1 - desiredMargin / 100);
  const profit = sellingPrice - costPrice;
  const markup = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  return {
    costPrice,
    sellingPrice,
    profit,
    grossMargin: desiredMargin,
    markup,
    breakEven: costPrice,
  };
}

export default function ProfitMarginCalculator() {
  const [mode, setMode] = useState<'price' | 'margin'>('price');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [desiredMargin, setDesiredMargin] = useState('');

  const costNum = useMemo(() => parseFloat(costPrice.replace(/,/g, '')) || 0, [costPrice]);
  const sellNum = useMemo(() => parseFloat(sellingPrice.replace(/,/g, '')) || 0, [sellingPrice]);
  const marginNum = parseFloat(desiredMargin) || 0;

  const result = useMemo(() => {
    if (mode === 'price') {
      return calculateProfit(costNum, sellNum);
    }
    return calculateFromMargin(costNum, marginNum);
  }, [mode, costNum, sellNum, marginNum]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه حاشیه سود و قیمت‌گذاری
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            محاسبه حاشیه سود ناخالص، درصد سود و نقطه سر به سر برای قیمت‌گذاری صحیح
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              حاشیه سود ناخالص
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              درصد سود
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              نقطه سر به سر
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات ورودی</h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('price')}
              aria-pressed={mode === 'price'}
              className={`flex-1 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                mode === 'price'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--surface-1)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
              }`}
            >
              ورود قیمت
            </button>
            <button
              type="button"
              onClick={() => setMode('margin')}
              aria-pressed={mode === 'margin'}
              className={`flex-1 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                mode === 'margin'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--surface-1)] border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
              }`}
            >
              ورود درصد سود
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="pm-cost" className="text-sm text-[var(--text-muted)]">
                قیمت تمام شده / هزینه (تومان)
              </label>
              <input
                id="pm-cost"
                type="text"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="قیمت تمام شده"
              />
            </div>

            {mode === 'price' ? (
              <div>
                <label htmlFor="pm-sell" className="text-sm text-[var(--text-muted)]">
                  قیمت فروش (تومان)
                </label>
                <input
                  id="pm-sell"
                  type="text"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="مثال: ۱۵,۰۰۰,۰۰۰"
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                  aria-label="قیمت فروش"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="pm-margin" className="text-sm text-[var(--text-muted)]">
                  درصد سود مورد نظر
                </label>
                <input
                  id="pm-margin"
                  type="text"
                  value={desiredMargin}
                  onChange={(e) => setDesiredMargin(e.target.value)}
                  placeholder="مثال: ۳۰"
                  className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                  aria-label="درصد سود مورد نظر"
                />
              </div>
            )}
          </div>
        </Card>

        {result && (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه حاشیه سود"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">نتیجه محاسبه</h2>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">قیمت تمام شده</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(result.costPrice)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">قیمت فروش</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(result.sellingPrice)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">مبلغ سود</span>
              <span className="text-sm font-bold text-[var(--color-success)]">
                {formatMoneyFa(result.profit)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">حاشیه سود ناخالص</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {result.grossMargin.toFixed(1)}٪
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">درصد سود (MarkUp)</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {result.markup.toFixed(1)}٪
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">نقطه سر به سر</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(result.breakEven)} تومان
              </span>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
              ⚠️ این محاسبات صرفاً جهت اطلاع‌رسانی است.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
