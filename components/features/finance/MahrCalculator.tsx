'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import FinancialTransparencyBox from '@/components/finance/FinancialTransparencyBox';
import { formatMoneyFa } from '@/shared/utils';
import ShareResult from '@/components/ui/ShareResult';

type MahrResult = {
  mahrAmount: number;
  mahrToday: number;
  ratio: number;
  increase: number;
};

function normalizeNumericInput(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[,\u066c]/g, '')
    .replace(/\u066b/g, '.')
    .trim();
}

function parseNumericInput(value: string): number {
  const parsed = parseFloat(normalizeNumericInput(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function calculateMahr(
  mahrAmount: number,
  marriageYearIndex: number,
  previousPaymentYearIndex: number,
): MahrResult | null {
  if (mahrAmount <= 0 || marriageYearIndex <= 0 || previousPaymentYearIndex <= 0) {
    return null;
  }

  const ratio = previousPaymentYearIndex / marriageYearIndex;
  const mahrToday = mahrAmount * ratio;
  const increase = mahrToday - mahrAmount;

  return { mahrAmount, mahrToday, ratio, increase };
}

export default function MahrCalculator() {
  const [mahrAmount, setMahrAmount] = useState('');
  const [marriageYearIndexInput, setMarriageYearIndexInput] = useState('');
  const [previousPaymentYearIndexInput, setPreviousPaymentYearIndexInput] = useState('');

  const mahrNum = useMemo(() => parseNumericInput(mahrAmount), [mahrAmount]);
  const marriageYearIndex = useMemo(
    () => parseNumericInput(marriageYearIndexInput),
    [marriageYearIndexInput],
  );
  const previousPaymentYearIndex = useMemo(
    () => parseNumericInput(previousPaymentYearIndexInput),
    [previousPaymentYearIndexInput],
  );

  const result = useMemo(
    () => calculateMahr(mahrNum, marriageYearIndex, previousPaymentYearIndex),
    [mahrNum, marriageYearIndex, previousPaymentYearIndex],
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--color-primary-rgb)/0.15),transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary)">
            محاسبه مهریه به نرخ روز
          </h1>
          <p className="text-base md:text-lg text-(--text-muted) leading-relaxed">
            محاسبه مهریه وجه رایج با استفاده از شاخص سال وقوع عقد و شاخص سال قبل از پرداخت، مطابق
            تبصره ماده ۱۰۸۲ قانون مدنی و آیین‌نامه اجرایی آن
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-(--text-muted)">
            <span className="rounded-full border border-(--border-light) px-3 py-1">
              مهریه وجه رایج
            </span>
            <span className="rounded-full border border-(--border-light) px-3 py-1">
              تبصره ماده ۱۰۸۲ قانون مدنی
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-(--text-primary)">اطلاعات محاسبه</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="mahr-amount" className="text-sm text-(--text-muted)">
                مبلغ مهریه به وجه رایج
              </label>
              <input
                id="mahr-amount"
                type="text"
                inputMode="decimal"
                value={mahrAmount}
                onChange={(event) => setMahrAmount(event.target.value)}
                placeholder="مثال: ۵۰۰۰۰۰ تومان"
                className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
                aria-label="مبلغ مهریه به وجه رایج"
              />
            </div>

            <div>
              <label htmlFor="mahr-marriage-index" className="text-sm text-(--text-muted)">
                شاخص سال وقوع عقد
              </label>
              <input
                id="mahr-marriage-index"
                type="text"
                inputMode="decimal"
                value={marriageYearIndexInput}
                onChange={(event) => setMarriageYearIndexInput(event.target.value)}
                placeholder="شاخص متوسط سالانه رسمی"
                className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
                aria-label="شاخص سال وقوع عقد"
              />
            </div>

            <div>
              <label htmlFor="mahr-previous-year-index" className="text-sm text-(--text-muted)">
                شاخص سال قبل از پرداخت
              </label>
              <input
                id="mahr-previous-year-index"
                type="text"
                inputMode="decimal"
                value={previousPaymentYearIndexInput}
                onChange={(event) => setPreviousPaymentYearIndexInput(event.target.value)}
                placeholder="شاخص متوسط سالانه رسمی"
                className="w-full mt-1 rounded-md border border-(--border-light) bg-(--surface-1) p-3 text-(--text-primary) focus:border-primary focus:outline-hidden"
                aria-label="شاخص سال قبل از پرداخت"
              />
            </div>
          </div>

          <div className="rounded-md bg-(--bg-subtle) p-3 text-xs leading-relaxed text-(--text-muted)">
            شاخص‌ها را از آخرین منبع رسمی معتبر وارد کنید. این ابزار عمداً عدد سالانه تأییدنشده یا
            تخمینی را به‌صورت پیش‌فرض استفاده نمی‌کند.
          </div>

          <div className="rounded-md bg-(--bg-subtle) p-3 text-xs text-(--text-muted)">
            فرمول: (شاخص سال قبل از پرداخت ÷ شاخص سال وقوع عقد) × مبلغ مهریه = مهریه به نرخ روز
          </div>
        </Card>

        {result ? (
          <Card
            className="p-6 space-y-3"
            role="region"
            aria-live="polite"
            aria-label="نتیجه محاسبه مهریه"
          >
            <h2 className="text-lg font-semibold text-(--text-primary)">نتیجه محاسبه</h2>
            <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
              <span className="text-sm text-(--text-muted)">مبلغ اصلی مهریه</span>
              <span className="text-sm font-bold text-(--text-primary)">
                {formatMoneyFa(result.mahrAmount)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
              <span className="text-sm text-(--text-muted)">افزایش بر اساس شاخص</span>
              <span className="text-sm font-bold text-success">
                {formatMoneyFa(result.increase)} تومان
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
              <span className="text-sm text-(--text-muted)">نسبت تعدیل</span>
              <span className="text-sm font-bold text-(--text-primary)">
                {result.ratio.toFixed(4)}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 border-b border-(--border-light)">
                <span className="text-sm font-semibold text-(--text-primary)">
                  مهریه به نرخ روز
                </span>
                <span className="text-lg font-bold text-success">
                  {formatMoneyFa(result.mahrToday)} تومان
                </span>
              </div>
            </div>
            <div className="rounded-md bg-(--bg-subtle) p-3 text-xs text-(--text-muted)">
              ⚠️ این محاسبه صرفاً جهت اطلاع‌رسانی است و جایگزین نظر مرجع قضایی یا مشاوره حقوقی نیست.
            </div>
            <ShareResult
              title="محاسبه مهریه به نرخ روز"
              text={`مهریه به نرخ روز: ${formatMoneyFa(result.mahrToday)} تومان | افزایش: ${formatMoneyFa(result.increase)} تومان`}
            />
          </Card>
        ) : null}
      </div>

      <FinancialTransparencyBox
        calculationName="شفافیت محاسبه مهریه وجه رایج"
        formulaSummary="(شاخص سال قبل از پرداخت ÷ شاخص سال وقوع عقد) × مبلغ مهریه"
        legalBasis="تبصره ماده ۱۰۸۲ قانون مدنی و آیین‌نامه اجرایی آن"
        dataSource="شاخص‌های متوسط سالانه رسمی واردشده توسط کاربر"
        disclaimer="نتیجه به صحت شاخص‌های واردشده وابسته است و صرفاً جهت اطلاع‌رسانی ارائه می‌شود؛ برای تصمیم حقوقی به منبع رسمی و مرجع صلاحیت‌دار مراجعه کنید."
      />
    </div>
  );
}
