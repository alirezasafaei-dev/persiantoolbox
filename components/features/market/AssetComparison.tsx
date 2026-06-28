'use client';

import { useState, useCallback, useMemo } from 'react';
import Card from '@/shared/ui/Card';

type AssetType = 'savings' | 'gold' | 'dollar' | 'euro';

interface AssetConfig {
  name: string;
  icon: string;
  monthlyReturns: number[]; // 12 months of historical returns
}

const ASSETS: Record<Exclude<AssetType, 'inflation'>, AssetConfig> = {
  savings: {
    name: 'سپرده بانکی',
    icon: '🏦',
    monthlyReturns: [1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9],
  },
  gold: {
    name: 'طلا',
    icon: '🥇',
    monthlyReturns: [2.1, -0.5, 3.2, 1.8, -1.2, 4.5, 2.3, -0.8, 1.5, 3.1, -0.3, 2.8],
  },
  dollar: {
    name: 'دلار',
    icon: '💵',
    monthlyReturns: [1.5, 0.8, -1.2, 2.3, 0.5, -0.8, 1.8, 0.3, -0.5, 1.2, 0.7, 1.1],
  },
  euro: {
    name: 'یورو',
    icon: '💶',
    monthlyReturns: [1.2, 0.5, -0.8, 1.8, 0.3, -0.5, 1.5, 0.2, -0.3, 0.9, 0.5, 0.8],
  },
};

const INFLATION_MONTHLY = [2.5, 2.8, 3.1, 2.9, 3.2, 2.7, 3.0, 2.6, 2.8, 3.1, 2.9, 2.7];

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

export default function AssetComparison() {
  const [selectedAssets, setSelectedAssets] = useState<AssetType[]>(['savings', 'gold', 'dollar']);
  const [initialAmount, setInitialAmount] = useState('10000000');
  const [showInflation, setShowInflation] = useState(true);

  const toggleAsset = useCallback((asset: AssetType) => {
    setSelectedAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset],
    );
  }, []);

  const comparisonData = useMemo(() => {
    const numAmount = parseFloat(initialAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return null;
    }

    const months = 12;
    const data = selectedAssets
      .map((assetType) => {
        const asset = ASSETS[assetType];
        if (!asset) {
          return null;
        }
        let currentValue = numAmount;
        const monthlyValues = [numAmount];

        for (let i = 0; i < months; i++) {
          currentValue *= 1 + (asset.monthlyReturns[i] ?? 0) / 100;
          monthlyValues.push(currentValue);
        }

        const totalReturn = ((currentValue - numAmount) / numAmount) * 100;
        const annualizedReturn = (Math.pow(currentValue / numAmount, 12 / months) - 1) * 100;

        return {
          type: assetType,
          name: asset.name,
          icon: asset.icon,
          monthlyValues,
          totalReturn,
          annualizedReturn,
          finalValue: currentValue,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Add inflation comparison
    if (showInflation) {
      let inflationValue = numAmount;
      const inflationValues = [numAmount];
      for (let i = 0; i < months; i++) {
        inflationValue *= 1 + (INFLATION_MONTHLY[i] ?? 0) / 100;
        inflationValues.push(inflationValue);
      }
      const inflationReturn = ((inflationValue - numAmount) / numAmount) * 100;

      data.push({
        type: 'inflation' as AssetType,
        name: 'تورم',
        icon: '📈',
        monthlyValues: inflationValues,
        totalReturn: inflationReturn,
        annualizedReturn: inflationReturn,
        finalValue: inflationValue,
      });
    }

    return data;
  }, [selectedAssets, initialAmount, showInflation]);

  const maxValue = useMemo(() => {
    if (!comparisonData) {
      return 0;
    }
    return Math.max(...comparisonData.flatMap((d) => d.monthlyValues));
  }, [comparisonData]);

  const minValue = useMemo(() => {
    if (!comparisonData) {
      return 0;
    }
    return Math.min(...comparisonData.flatMap((d) => d.monthlyValues));
  }, [comparisonData]);

  const chartHeight = 200;

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)]">مقایسه بازده دارایی‌ها</h3>
      <p className="text-sm text-[var(--text-muted)]">
        بازده دارایی‌های مختلف را در ۱۲ ماه گذشته مقایسه کنید.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            مبلغ سرمایه‌گذاری (تومان)
          </label>
          <input
            type="number"
            min="0"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            aria-label="مبلغ سرمایه‌گذاری"
            className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-primary)]">دارایی‌ها</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ASSETS) as AssetType[]).map((asset) => (
              <button
                key={asset}
                type="button"
                aria-pressed={selectedAssets.includes(asset)}
                onClick={() => toggleAsset(asset)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedAssets.includes(asset)
                    ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                    : 'bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {(ASSETS as Record<string, AssetConfig | undefined>)[asset]?.icon ?? '❓'}{' '}
                {(ASSETS as Record<string, AssetConfig | undefined>)[asset]?.name ?? asset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showInflation"
          checked={showInflation}
          onChange={(e) => setShowInflation(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="showInflation" className="text-sm text-[var(--text-primary)]">
          نمایش تورم به عنوان مرجع
        </label>
      </div>

      {comparisonData ? (
        <div className="space-y-6">
          {/* Chart */}
          <div className="p-4 bg-[var(--surface-2)] rounded-lg">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-3">
              نمودار مقایسه‌ای ۱۲ ماهه
            </div>
            <div className="relative" style={{ height: chartHeight }}>
              <svg
                width="100%"
                height={chartHeight}
                viewBox={`0 0 100 ${chartHeight}`}
                preserveAspectRatio="none"
              >
                {comparisonData.map((data, dataIdx) => {
                  const range = maxValue - minValue || 1;
                  const points = data.monthlyValues
                    .map((v, i) => {
                      const x = (i / 11) * 100;
                      const y = chartHeight - ((v - minValue) / range) * (chartHeight - 20) - 10;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  const colors = ['#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ef4444'];
                  const color = colors[dataIdx % colors.length];

                  return (
                    <polyline
                      key={data.type}
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {comparisonData.map((data, dataIdx) => {
                const colors = [
                  'text-blue-500',
                  'text-yellow-500',
                  'text-green-500',
                  'text-purple-500',
                  'text-red-500',
                ];
                const color = colors[dataIdx % colors.length];
                return (
                  <div key={data.type} className={`flex items-center gap-1 text-xs ${color}`}>
                    <span className="w-3 h-0.5 bg-current rounded" />
                    {data.icon} {data.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-medium)]">
                  <th className="text-right py-2 text-[var(--text-muted)]">دارایی</th>
                  <th className="text-right py-2 text-[var(--text-muted)]">مبلغ اولیه</th>
                  <th className="text-right py-2 text-[var(--text-muted)]">مبلغ نهایی</th>
                  <th className="text-right py-2 text-[var(--text-muted)]">بازده کل</th>
                  <th className="text-right py-2 text-[var(--text-muted)]">بازده سالانه</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((data) => (
                  <tr key={data.type} className="border-b border-[var(--border-light)]">
                    <td className="py-2 text-[var(--text-primary)]">
                      {data.icon} {data.name}
                    </td>
                    <td className="py-2 text-[var(--text-primary)]">
                      {formatMoney(parseFloat(initialAmount))}
                    </td>
                    <td className="py-2 text-[var(--text-primary)]">
                      {formatMoney(data.finalValue)}
                    </td>
                    <td
                      className={`py-2 font-medium ${data.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatPercent(data.totalReturn)}
                    </td>
                    <td
                      className={`py-2 font-medium ${data.annualizedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatPercent(data.annualizedReturn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-[var(--text-muted)] text-center">
            ⚠️ داده‌ها بر اساس بازده‌های تقریبی تاریخی است و تضمینی برای بازده آینده نیست.
          </div>
        </div>
      ) : null}
    </Card>
  );
}
