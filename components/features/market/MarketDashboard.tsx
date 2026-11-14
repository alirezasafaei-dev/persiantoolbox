'use client';

import { useRef, useState } from 'react';
import { useMarketData } from '@/shared/hooks/useMarketData';
import Card from '@/shared/ui/Card';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import InvestmentSimulator, { type InvestmentInputs } from './InvestmentSimulator';
import AssetComparison from './AssetComparison';
import PresetScenarios from './PresetScenarios';

const referenceRateFormatter = new Intl.NumberFormat('fa-IR', {
  maximumSignificantDigits: 8,
});

function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(num));
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export default function MarketDashboard() {
  const { data, loading, error, refresh } = useMarketData();
  const simulatorRef = useRef<HTMLElement>(null);
  const [applied, setApplied] = useState<{ inputs: InvestmentInputs; revision: number }>();

  function applyScenario(inputs: InvestmentInputs) {
    setApplied((previous) => ({ inputs, revision: (previous?.revision ?? 0) + 1 }));
    simulatorRef.current?.focus();
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <p className="text-danger">خطا در دریافت اطلاعات بازار</p>
            <p className="text-sm text-(--text-muted) mt-2">{error}</p>
            <button type="button" onClick={refresh} className="mt-4 text-primary hover:underline">
              تلاش مجدد
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  let freshnessDotClass = 'bg-red-500';
  let freshnessLabel = 'داده قدیمی';
  if (data.freshness === 'live') {
    freshnessDotClass = 'bg-green-500';
    freshnessLabel = 'داده زنده';
  } else if (data.freshness === 'cached') {
    freshnessDotClass = 'bg-yellow-500';
    freshnessLabel = 'کش شده';
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-(--text-primary)">داشبورد بازار</h1>
        <div className="flex items-center gap-2 text-sm text-(--text-muted)">
          <span className={`w-2 h-2 rounded-full ${freshnessDotClass}`} />
          <span>{freshnessLabel}</span>
          <button type="button" onClick={refresh} className="text-primary hover:underline">
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Currency Rates */}
      <section>
        <h2 className="text-xl font-bold text-(--text-primary) mb-4">نرخ ارزها</h2>
        <p className="mb-4 text-sm text-(--text-muted)">
          نرخ‌های مرجع ارز به‌ازای یک دلار آمریکا از ExchangeRate-API دریافت می‌شوند و ممکن است با
          قیمت معامله در بازار ایران متفاوت باشند.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.values(data.currencies).map((currency) => (
            <Card key={currency.code} className="p-4">
              <div className="text-center">
                <div className="text-sm text-(--text-muted)">{currency.name}</div>
                <div className="text-lg font-bold text-(--text-primary)">
                  {referenceRateFormatter.format(currency.rate)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Gold Price */}
      <section>
        <h2 className="text-xl font-bold text-(--text-primary) mb-4">قیمت طلا</h2>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-(--text-muted)">
                برآورد هر گرم طلا بر اساس Tether Gold و نرخ مرجع ریال
              </div>
              <div className="text-2xl font-bold text-(--text-primary)">
                {formatNumber(data.gold.pricePerGram)} ریال
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Crypto Prices */}
      <section>
        <h2 className="text-xl font-bold text-(--text-primary) mb-4">ارزهای دیجیتال</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(data.crypto).map((crypto) => (
            <Card key={crypto.symbol} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-(--text-muted)">{crypto.name}</div>
                  <div className="text-2xl font-bold text-(--text-primary)">
                    ${formatNumber(crypto.priceUSD)}
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {formatChange(crypto.change24h)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="text-sm text-(--text-muted)">
        <p>منابع داده: {data.sources.join(', ')}</p>
        <p>آخرین بروزرسانی: {new Date(data.timestamp).toLocaleString('fa-IR')}</p>
      </section>

      {/* Investment Simulator */}
      <section
        ref={simulatorRef}
        tabIndex={-1}
        aria-label="شبیه‌ساز سرمایه‌گذاری"
        className="scroll-mt-24"
      >
        <InvestmentSimulator key={applied?.revision} initial={applied?.inputs} />
      </section>

      {/* Asset Comparison */}
      <section>
        <AssetComparison />
      </section>

      {/* Preset Scenarios */}
      <section>
        <PresetScenarios onApply={applyScenario} />
      </section>
    </div>
  );
}
