'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import { formatMoneyFa } from '@/shared/utils';

type MahrResult = {
  mahrAmount: number;
  mahrToday: number;
  ratio: number;
  increase: number;
};

const CPI_INDEXES: Record<number, number> = {
  1390: 69.7,
  1391: 81.8,
  1392: 100.0,
  1393: 121.8,
  1394: 139.4,
  1395: 157.0,
  1396: 181.5,
  1397: 235.2,
  1398: 293.9,
  1399: 331.2,
  1400: 408.8,
  1401: 510.6,
  1402: 675.8,
  1403: 892.4,
  1404: 1085.7,
  1405: 1280.0,
};

function calculateMahr(
  mahrAmount: number,
  marriageIndex: number,
  currentIndex: number,
): MahrResult | null {
  if (mahrAmount <= 0 || marriageIndex <= 0 || currentIndex <= 0) {
    return null;
  }
  const ratio = currentIndex / marriageIndex;
  const mahrToday = mahrAmount * ratio;
  const increase = mahrToday - mahrAmount;
  return { mahrAmount, mahrToday, ratio, increase };
}

export default function MahrCalculator() {
  const [mahrAmount, setMahrAmount] = useState('');
  const [marriageYear, setMarriageYear] = useState('1400');
  const [marriageIndexManual, setMarriageIndexManual] = useState('');
  const [currentYear, setCurrentYear] = useState('1405');
  const [currentIndexManual, setCurrentIndexManual] = useState('');
  const [useManualIndex, setUseManualIndex] = useState(false);

  const parsedMarriage = parseFloat(marriageIndexManual);
  const parsedCurrent = parseFloat(currentIndexManual);
  const marriageIndex = useManualIndex
    ? (Number.isNaN(parsedMarriage) ? 0 : parsedMarriage)
    : (CPI_INDEXES[parseInt(marriageYear)] ?? 0);
  const currentIndex = useManualIndex
    ? (Number.isNaN(parsedCurrent) ? 0 : parsedCurrent)
    : (CPI_INDEXES[parseInt(currentYear)] ?? 0);

  const mahrNum = useMemo(
    () => parseFloat(mahrAmount.replace(/,/g, '')) || 0,
    [mahrAmount],
  );

  const result = useMemo(
    () => calculateMahr(mahrNum, marriageIndex, currentIndex),
    [mahrNum, marriageIndex, currentIndex],
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه مهریه به نرخ روز
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            محاسبه مهریه به نرخ روز بر اساس شاخص CPI طبق ماده ۱۰۸۲ قانون مدنی و ماده ۲۲ قانون حمایت خانواده
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              ماده ۱۰۸۲ قانون مدنی
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              ماده ۲۲ قانون حمایت خانواده
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات مهریه</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="mahr-amount" className="text-sm text-[var(--text-muted)]">
                مبلغ مهریه (تومان)
              </label>
              <input
                id="mahr-amount"
                type="text"
                value={mahrAmount}
                onChange={(e) => setMahrAmount(e.target.value)}
                placeholder="مثال: ۵۰۰ سکه یا مبلغ تومان"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="مبلغ مهریه"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="mahr-manual"
                type="checkbox"
                checked={useManualIndex}
                onChange={(e) => setUseManualIndex(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="mahr-manual" className="text-sm text-[var(--text-muted)]">
                ورود دستی شاخص CPI
              </label>
            </div>

            {useManualIndex ? (
              <>
                <div>
                  <label htmlFor="mahr-marriage-index" className="text-sm text-[var(--text-muted)]">
                    شاخص CPI سال ازدواج
                  </label>
                  <input
                    id="mahr-marriage-index"
                    type="text"
                    value={marriageIndexManual}
                    onChange={(e) => setMarriageIndexManual(e.target.value)}
                    placeholder="مثال: ۴۰۸.۸"
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="شاخص CPI سال ازدواج"
                  />
                </div>
                <div>
                  <label htmlFor="mahr-current-index" className="text-sm text-[var(--text-muted)]">
                    شاخص CPI سال فعلی
                  </label>
                  <input
                    id="mahr-current-index"
                    type="text"
                    value={currentIndexManual}
                    onChange={(e) => setCurrentIndexManual(e.target.value)}
                    placeholder="مثال: ۱۲۸۰"
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="شاخص CPI سال فعلی"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="mahr-marriage-year" className="text-sm text-[var(--text-muted)]">
                    سال ازدواج
                  </label>
                  <select
                    id="mahr-marriage-year"
                    value={marriageYear}
                    onChange={(e) => setMarriageYear(e.target.value)}
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="سال ازدواج"
                  >
                    {Object.keys(CPI_INDEXES).map((y) => (
                      <option key={y} value={y}>
                        {y} (شاخص: {CPI_INDEXES[parseInt(y)]})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="mahr-current-year" className="text-sm text-[var(--text-muted)]">
                    سال فعلی
                  </label>
                  <select
                    id="mahr-current-year"
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="سال فعلی"
                  >
                    {Object.keys(CPI_INDEXES).map((y) => (
                      <option key={y} value={y}>
                        {y} (شاخص: {CPI_INDEXES[parseInt(y)]})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
            فرمول: (شاخص سال فعلی ÷ شاخص سال ازدواج) × مبلغ مهریه = مهریه به نرخ روز
          </div>
        </Card>

        {result && (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه مهریه"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">نتیجه محاسبه</h2>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">مبلغ اصلی مهریه</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(result.mahrAmount)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">افزایش بر اساس تورم</span>
              <span className="text-sm font-bold text-[var(--color-success)]">
                {formatMoneyFa(result.increase)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">نسبت افزایش</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {result.ratio.toFixed(4)}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  مهریه به نرخ روز
                </span>
                <span className="text-lg font-bold text-[var(--color-success)]">
                  {formatMoneyFa(result.mahrToday)} تومان
                </span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
              ⚠️ این محاسبات صرفاً جهت اطلاع‌رسانی است و جایگزین حکم دادگاه نیست.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
