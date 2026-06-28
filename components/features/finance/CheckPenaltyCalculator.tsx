'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';
import { formatMoneyFa } from '@/shared/utils';
import ShareResult from '@/components/ui/ShareResult';

type Result = {
  principal: number;
  penalty: number;
  total: number;
  ratio: number;
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

function calculate(
  principal: number,
  dueDateIndex: number,
  paymentDateIndex: number,
): Result | null {
  if (principal <= 0 || dueDateIndex <= 0 || paymentDateIndex <= 0) {
    return null;
  }
  const ratio = paymentDateIndex / dueDateIndex;
  const total = principal * ratio;
  const penalty = total - principal;
  return { principal, penalty, total, ratio };
}

export default function CheckPenaltyCalculator() {
  const [principal, setPrincipal] = useState('');
  const [dueYear, setDueYear] = useState('1400');
  const [dueIndexManual, setDueIndexManual] = useState('');
  const [payYear, setPayYear] = useState('1405');
  const [payIndexManual, setPayIndexManual] = useState('');
  const [useManualIndex, setUseManualIndex] = useState(false);

  const parsedDue = parseFloat(dueIndexManual);
  const parsedPay = parseFloat(payIndexManual);
  const dueIndex = useManualIndex
    ? Number.isNaN(parsedDue)
      ? 0
      : parsedDue
    : (CPI_INDEXES[parseInt(dueYear)] ?? 0);
  const payIndex = useManualIndex
    ? Number.isNaN(parsedPay)
      ? 0
      : parsedPay
    : (CPI_INDEXES[parseInt(payYear)] ?? 0);

  const principalNum = useMemo(() => parseFloat(principal.replace(/,/g, '')) || 0, [principal]);

  const result = useMemo(
    () => calculate(principalNum, dueIndex, payIndex),
    [principalNum, dueIndex, payIndex],
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه خسارت تأخیر تأدیه چک
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            محاسبه خسارت بر اساس شاخص CPI بانک مرکزی طبق ماده ۵۲۲ قانون آیین دادرسی مدنی
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              ماده ۵۲۲ قانون آیین دادرسی مدنی
            </span>
            <span className="rounded-full border border-[var(--border-light)] px-3 py-1">
              شاخص CPI بانک مرکزی
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات چک</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="cp-principal" className="text-sm text-[var(--text-muted)]">
                مبلغ اصلی چک (تومان)
              </label>
              <input
                id="cp-principal"
                type="text"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="مثال: ۵۰۰,۰۰۰,۰۰۰"
                className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                aria-label="مبلغ اصلی چک"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="cp-manual"
                type="checkbox"
                checked={useManualIndex}
                onChange={(e) => setUseManualIndex(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="cp-manual" className="text-sm text-[var(--text-muted)]">
                ورود دستی شاخص CPI
              </label>
            </div>

            {useManualIndex ? (
              <>
                <div>
                  <label htmlFor="cp-due-index" className="text-sm text-[var(--text-muted)]">
                    شاخص CPI سال سررسید
                  </label>
                  <input
                    id="cp-due-index"
                    type="text"
                    value={dueIndexManual}
                    onChange={(e) => setDueIndexManual(e.target.value)}
                    placeholder="مثال: ۴۰۸.۸"
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="شاخص CPI سال سررسید"
                  />
                </div>
                <div>
                  <label htmlFor="cp-pay-index" className="text-sm text-[var(--text-muted)]">
                    شاخص CPI سال پرداخت
                  </label>
                  <input
                    id="cp-pay-index"
                    type="text"
                    value={payIndexManual}
                    onChange={(e) => setPayIndexManual(e.target.value)}
                    placeholder="مثال: ۱۲۸۰"
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="شاخص CPI سال پرداخت"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="cp-due-year" className="text-sm text-[var(--text-muted)]">
                    سال سررسید چک
                  </label>
                  <select
                    id="cp-due-year"
                    value={dueYear}
                    onChange={(e) => setDueYear(e.target.value)}
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="سال سررسید چک"
                  >
                    {Object.keys(CPI_INDEXES).map((y) => (
                      <option key={y} value={y}>
                        {y} (شاخص: {CPI_INDEXES[parseInt(y)]})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cp-pay-year" className="text-sm text-[var(--text-muted)]">
                    سال پرداخت
                  </label>
                  <select
                    id="cp-pay-year"
                    value={payYear}
                    onChange={(e) => setPayYear(e.target.value)}
                    className="w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label="سال پرداخت"
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
            فرمول: (شاخص سال پرداخت ÷ شاخص سال سررسید) × مبلغ اصلی = مبلغ قابل پرداخت به نرخ روز
          </div>
        </Card>

        {result ? (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه خسارت"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">نتیجه محاسبه</h2>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">مبلغ اصلی چک</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {formatMoneyFa(result.principal)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
              <span className="text-sm text-[var(--text-muted)]">خسارت تأخیر تأدیه</span>
              <span className="text-sm font-bold text-[var(--color-success)]">
                {formatMoneyFa(result.penalty)} تومان
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
                  مبلغ قابل پرداخت به نرخ روز
                </span>
                <span className="text-lg font-bold text-[var(--color-success)]">
                  {formatMoneyFa(result.total)} تومان
                </span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
              ⚠️ این محاسبات صرفاً جهت اطلاع‌رسانی است و جایگزین حکم دادگاه نیست.
            </div>
            <ShareResult
              title="محاسبه خسارت تأخیر تأدیه چک"
              text={`خسارت: ${formatMoneyFa(result.penalty)} تومان | مبلغ قابل پرداخت: ${formatMoneyFa(result.total)} تومان`}
            />
          </Card>
        ) : null}
      </div>

      <FinancialTransparencyBox
        calculationName="شفافیت محاسبه خسارت تأخیر تأدیه چک"
        formulaSummary="(شاخص سال پرداخت ÷ شاخص سال سررسید) × مبلغ اصلی"
        legalBasis="ماده ۵۲۲ قانون آیین دادرسی مدنی"
        dataSource="شاخص CPI بانک مرکزی ج.ا.ایران"
        lastUpdated="۱۴۰۵"
      />
    </div>
  );
}
