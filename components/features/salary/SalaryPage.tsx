'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SavedFinanceCalculations from '@/components/features/finance/SavedFinanceCalculations';
import { formatMoneyFa, parseLooseNumber } from '@/shared/utils/numbers';
import { saveFinanceCalculation } from '@/shared/analytics/financeSaved';
import { getSessionJson, setSessionJson } from '@/shared/storage/sessionStorage';
import {
  calculateSalary,
  calculateMinimumWage,
  calculateGrossFromNet,
  getSalaryLaws,
} from '@/features/salary/index';
import type { SalaryInput, SalaryOutput, MinimumWageOutput } from '@/features/salary/salary.types';
import { AnimatedCard, FadeIn } from '@/shared/ui/AnimatedComponents';
import Button from '@/shared/ui/Button';
import MoneyInput from '@/shared/ui/MoneyInput';
import NumericInput from '@/shared/ui/NumericInput';
import { tokens, toolCategories } from '@/shared/constants/tokens';
import { useToast } from '@/shared/ui/toast-context';
import AsyncState from '@/shared/ui/AsyncState';

type CalculationMode = 'gross-to-net' | 'net-to-gross' | 'minimum-wage';
type SalaryLawsFeed = {
  version: string;
  updatedAt: string;
  source: string;
  region: string;
  years: Record<string, unknown>;
};

type SalaryFormState = {
  mode: CalculationMode;
  baseSalaryText: string;
  netSalaryText: string;
  workingDaysText: string;
  workExperienceYearsText: string;
  overtimeHoursText: string;
  nightOvertimeHoursText: string;
  holidayOvertimeHoursText: string;
  missionDaysText: string;
  isMarried: boolean;
  numberOfChildrenText: string;
  hasWorkerCoupon: boolean;
  hasTransportation: boolean;
  otherBenefitsText: string;
  otherDeductionsText: string;
  isDevelopmentZone: boolean;
};

const sessionKey = 'salary.form.v2';

export default function SalaryPage() {
  const { showToast } = useToast();
  const financialActiveStyle = {
    backgroundColor: toolCategories.financial.primary,
    borderColor: toolCategories.financial.primary,
    color: '#0b1120',
  };
  const initial = useMemo<SalaryFormState>(() => {
    return (
      getSessionJson<SalaryFormState>(sessionKey) ?? {
        mode: 'gross-to-net',
        baseSalaryText: '15000000',
        netSalaryText: '12000000',
        workingDaysText: '30',
        workExperienceYearsText: '0',
        overtimeHoursText: '0',
        nightOvertimeHoursText: '0',
        holidayOvertimeHoursText: '0',
        missionDaysText: '0',
        isMarried: false,
        numberOfChildrenText: '0',
        hasWorkerCoupon: true,
        hasTransportation: true,
        otherBenefitsText: '0',
        otherDeductionsText: '0',
        isDevelopmentZone: false,
      }
    );
  }, []);

  const [form, setForm] = useState<SalaryFormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryOutput | null>(null);
  const [minimumWageResult, setMinimumWageResult] = useState<MinimumWageOutput | null>(null);
  const [lawsFeed, setLawsFeed] = useState<SalaryLawsFeed | null>(null);
  const [lawsFeedStatus, setLawsFeedStatus] = useState<'loading' | 'ready' | 'stale' | 'disabled'>(
    'loading',
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const initialRef = useMemo(() => JSON.stringify(initial), [initial]);

  const advancedSummary = [
    form.isMarried ? 'متاهل' : null,
    form.hasWorkerCoupon ? 'بن کارگری' : null,
    form.hasTransportation ? 'حمل‌ونقل' : null,
    form.isDevelopmentZone ? 'منطقه توسعه‌یافته' : null,
    form.otherBenefitsText && form.otherBenefitsText !== '0' ? 'مزایای دیگر' : null,
    form.otherDeductionsText && form.otherDeductionsText !== '0' ? 'کسورات دیگر' : null,
  ].filter(Boolean);

  const copyValue = async (value: string, label: string) => {
    const text = value.trim();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} کپی شد`, 'success');
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  const saveSalaryResult = () => {
    if (!result) {
      return;
    }
    saveFinanceCalculation({
      tool: 'salary',
      title: 'سناریوی محاسبه حقوق',
      summary: `خالص: ${formatMoneyFa(result.netSalary)} تومان | کسورات: ${formatMoneyFa(
        result.summary.totalDeductions,
      )} تومان`,
    });
    showToast('نتیجه حقوق در مرورگر ذخیره شد', 'success');
  };

  const saveMinimumWageResult = () => {
    if (!minimumWageResult) {
      return;
    }
    saveFinanceCalculation({
      tool: 'salary',
      title: 'سناریوی حداقل دستمزد',
      summary: `ناخالص: ${formatMoneyFa(minimumWageResult.totalGross)} تومان | خالص: ${formatMoneyFa(
        minimumWageResult.netSalary,
      )} تومان`,
    });
    showToast('نتیجه حداقل دستمزد در مرورگر ذخیره شد', 'success');
  };

  useEffect(() => {
    setSessionJson(sessionKey, form);
  }, [form]);

  useEffect(() => {
    if (hasInteracted) {
      return;
    }
    if (JSON.stringify(form) !== initialRef) {
      setHasInteracted(true);
    }
  }, [form, hasInteracted, initialRef]);

  const onCalculate = useCallback(() => {
    setError(null);
    setResult(null);
    setMinimumWageResult(null);

    try {
      if (form.mode === 'minimum-wage') {
        const workExperienceYears = parseLooseNumber(form.workExperienceYearsText) ?? 0;
        const numberOfChildren = parseLooseNumber(form.numberOfChildrenText) ?? 0;
        const otherDeductions = parseLooseNumber(form.otherDeductionsText) ?? 0;

        const minWageResult = calculateMinimumWage({
          workExperienceYears,
          isMarried: form.isMarried,
          numberOfChildren,
          isDevelopmentZone: form.isDevelopmentZone,
          otherDeductions,
        });

        setMinimumWageResult(minWageResult);
      } else if (form.mode === 'net-to-gross') {
        const netSalary = parseLooseNumber(form.netSalaryText);
        if (netSalary === null) {
          return setError('لطفاً حقوق خالص را به‌صورت عدد وارد کنید.');
        }

        const input: Omit<SalaryInput, 'baseSalary'> = {
          workingDays: parseLooseNumber(form.workingDaysText) ?? 30,
          workExperienceYears: parseLooseNumber(form.workExperienceYearsText) ?? 0,
          overtimeHours: parseLooseNumber(form.overtimeHoursText) ?? 0,
          nightOvertimeHours: parseLooseNumber(form.nightOvertimeHoursText) ?? 0,
          holidayOvertimeHours: parseLooseNumber(form.holidayOvertimeHoursText) ?? 0,
          missionDays: parseLooseNumber(form.missionDaysText) ?? 0,
          isMarried: form.isMarried,
          numberOfChildren: parseLooseNumber(form.numberOfChildrenText) ?? 0,
          hasWorkerCoupon: form.hasWorkerCoupon,
          hasTransportation: form.hasTransportation,
          otherBenefits: parseLooseNumber(form.otherBenefitsText) ?? 0,
          otherDeductions: parseLooseNumber(form.otherDeductionsText) ?? 0,
          isDevelopmentZone: form.isDevelopmentZone,
        };

        const calculationResult = calculateGrossFromNet(netSalary, input);
        setResult(calculationResult);
      } else {
        const baseSalary = parseLooseNumber(form.baseSalaryText);
        if (baseSalary === null) {
          return setError('لطفاً حقوق پایه را به‌صورت عدد وارد کنید.');
        }

        const input: SalaryInput = {
          baseSalary,
          workingDays: parseLooseNumber(form.workingDaysText) ?? 30,
          workExperienceYears: parseLooseNumber(form.workExperienceYearsText) ?? 0,
          overtimeHours: parseLooseNumber(form.overtimeHoursText) ?? 0,
          nightOvertimeHours: parseLooseNumber(form.nightOvertimeHoursText) ?? 0,
          holidayOvertimeHours: parseLooseNumber(form.holidayOvertimeHoursText) ?? 0,
          missionDays: parseLooseNumber(form.missionDaysText) ?? 0,
          isMarried: form.isMarried,
          numberOfChildren: parseLooseNumber(form.numberOfChildrenText) ?? 0,
          hasWorkerCoupon: form.hasWorkerCoupon,
          hasTransportation: form.hasTransportation,
          otherBenefits: parseLooseNumber(form.otherBenefitsText) ?? 0,
          otherDeductions: parseLooseNumber(form.otherDeductionsText) ?? 0,
          isDevelopmentZone: form.isDevelopmentZone,
        };

        const calculationResult = calculateSalary(input);
        setResult(calculationResult);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'خطای نامشخص رخ داد.';
      setError(message);
    }
  }, [form]);

  const laws = getSalaryLaws();
  const getFieldError = (label: string, value: string) => {
    if (!value.trim()) {
      return undefined;
    }
    return parseLooseNumber(value) === null ? `${label} باید عدد معتبر باشد.` : undefined;
  };

  useEffect(() => {
    onCalculate();
  }, [onCalculate]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadLawsFeed = async () => {
      try {
        const response = await fetch('/api/data/salary-laws', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('salary-laws feed unavailable');
        }
        const payload = (await response.json()) as SalaryLawsFeed;
        if (!active) {
          return;
        }
        setLawsFeed(payload);
        const updated = new Date(payload.updatedAt);
        const ageMs = Date.now() - updated.getTime();
        const maxFreshMs = 1000 * 60 * 60 * 24 * 90;
        setLawsFeedStatus(Number.isFinite(ageMs) && ageMs > maxFreshMs ? 'stale' : 'ready');
      } catch {
        if (!active) {
          return;
        }
        setLawsFeedStatus('disabled');
      }
    };

    loadLawsFeed();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="space-y-8 p-6">
        {/* Header */}
        <FadeIn delay={0}>
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white shadow-[var(--shadow-strong)] mb-6"
              style={{ backgroundColor: toolCategories.financial.primary }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <h1 className="text-4xl font-black text-[var(--text-primary)] mb-4">
              محاسبه‌گر حقوق و دستمزد پیشرفته
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              {'محاسبه حقوق و مالیات بر اساس قوانین سال '}
              {laws.year}
              {' با پشتیبانی از معافیت‌های قانونی و نرخ‌های تصاعدی.'}{' '}
              {'شامل بیمه تامین اجتماعی، مزایا و کسورات مختلف.'}
            </p>
            <div className="mt-4 text-sm text-[var(--text-muted)]">
              حداقل دستمزد: {formatMoneyFa(laws.minimumWage)} تومان | معافیت مالیات:{' '}
              {formatMoneyFa(laws.taxExemption)} تومان ماهانه
            </div>
            <div className="mt-3">
              {lawsFeedStatus === 'loading' && (
                <div className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                  در حال بررسی نسخه قوانین حقوق...
                </div>
              )}
              {lawsFeedStatus === 'ready' && lawsFeed && (
                <div className="inline-flex items-center rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.12)] px-3 py-1 text-xs text-[var(--color-success)]">
                  آخرین بروزرسانی قوانین: {lawsFeed.updatedAt} | {lawsFeed.version}
                </div>
              )}
              {lawsFeedStatus === 'stale' && lawsFeed && (
                <div className="inline-flex items-center rounded-full border border-[rgb(var(--color-warning-rgb)/0.35)] bg-[rgb(var(--color-warning-rgb)/0.14)] px-3 py-1 text-xs text-[var(--color-warning)]">
                  هشدار: داده قوانین قدیمی است ({lawsFeed.updatedAt}) و نیاز به بازبینی دارد.
                </div>
              )}
              {lawsFeedStatus === 'disabled' && (
                <div className="inline-flex items-center rounded-full border border-[rgb(var(--color-danger-rgb)/0.35)] bg-[rgb(var(--color-danger-rgb)/0.12)] px-3 py-1 text-xs text-[var(--color-danger)]">
                  سرویس قوانین داخلی موقتا در دسترس نیست. محاسبه با قوانین نسخه محلی انجام می‌شود.
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {error && (
          <div className="max-w-4xl mx-auto">
            <AsyncState
              variant="error"
              title="خطا در محاسبه"
              description={error}
              className="border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.12)]"
            />
          </div>
        )}

        {/* Input Form */}
        <FadeIn delay={0.15}>
          <div className="max-w-6xl mx-auto">
            <AnimatedCard className="p-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {(['gross-to-net', 'net-to-gross', 'minimum-wage'] as CalculationMode[]).map(
                  (mode) => (
                    <motion.button
                      key={mode}
                      onClick={() => setForm((s) => ({ ...s, mode }))}
                      className={[
                        'p-4 rounded-[var(--radius-lg)] border-2 text-start transition-all duration-[var(--motion-medium)]',
                        form.mode === mode
                          ? 'border-opacity-100 shadow-[var(--shadow-medium)] text-[var(--text-primary)]'
                          : 'border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]',
                      ].join(' ')}
                      {...(form.mode === mode ? { style: financialActiveStyle } : {})}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-bold mb-1">
                        {mode === 'gross-to-net' && 'حقوق ناخالص به خالص'}
                        {mode === 'net-to-gross' && 'حقوق خالص به ناخالص'}
                        {mode === 'minimum-wage' && 'حداقل دستمزد'}
                      </div>
                      <div
                        className={`text-xs ${form.mode === mode ? 'text-[color:rgba(11,17,32,0.8)]' : 'text-[var(--text-muted)]'}`}
                      >
                        {mode === 'gross-to-net' && 'محاسبه حقوق خالص بر اساس حقوق پایه'}
                        {mode === 'net-to-gross' && 'محاسبه حقوق پایه از خالص'}
                        {mode === 'minimum-wage' && 'محاسبه حداقل دستمزد قانونی'}
                      </div>
                    </motion.button>
                  ),
                )}
              </div>

              {form.mode !== 'minimum-wage' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {form.mode === 'gross-to-net' && (
                    <MoneyInput
                      id="salary-base"
                      label="حقوق پایه (تومان)"
                      value={form.baseSalaryText}
                      onValueChange={(value) => setForm((s) => ({ ...s, baseSalaryText: value }))}
                      error={getFieldError('حقوق پایه', form.baseSalaryText)}
                    />
                  )}
                  {form.mode === 'net-to-gross' && (
                    <MoneyInput
                      id="salary-net"
                      label="حقوق خالص (تومان)"
                      value={form.netSalaryText}
                      onValueChange={(value) => setForm((s) => ({ ...s, netSalaryText: value }))}
                      error={getFieldError('حقوق خالص', form.netSalaryText)}
                    />
                  )}
                  <NumericInput
                    id="salary-working-days"
                    label="روزهای کاری"
                    value={form.workingDaysText}
                    onValueChange={(value) => setForm((s) => ({ ...s, workingDaysText: value }))}
                    error={getFieldError('روزهای کاری', form.workingDaysText)}
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <NumericInput
                  id="salary-experience"
                  label="سابقه کار (سال)"
                  value={form.workExperienceYearsText}
                  onValueChange={(value) => setForm((s) => ({ ...s, workExperienceYearsText: value }))}
                  error={getFieldError('سابقه کار', form.workExperienceYearsText)}
                />
                <NumericInput
                  id="salary-overtime"
                  label="ساعات اضافه کاری"
                  value={form.overtimeHoursText}
                  onValueChange={(value) => setForm((s) => ({ ...s, overtimeHoursText: value }))}
                  error={getFieldError('ساعات اضافه کاری', form.overtimeHoursText)}
                />
                <NumericInput
                  id="salary-night-overtime"
                  label="اضافه کاری شب"
                  value={form.nightOvertimeHoursText}
                  onValueChange={(value) =>
                    setForm((s) => ({ ...s, nightOvertimeHoursText: value }))
                  }
                  error={getFieldError('اضافه کاری شب', form.nightOvertimeHoursText)}
                />
                <NumericInput
                  id="salary-holiday-overtime"
                  label="اضافه کاری تعطیل"
                  value={form.holidayOvertimeHoursText}
                  onValueChange={(value) =>
                    setForm((s) => ({ ...s, holidayOvertimeHoursText: value }))
                  }
                  error={getFieldError('اضافه کاری تعطیل', form.holidayOvertimeHoursText)}
                />
                <NumericInput
                  id="salary-mission-days"
                  label="روزهای ماموریت"
                  value={form.missionDaysText}
                  onValueChange={(value) => setForm((s) => ({ ...s, missionDaysText: value }))}
                  error={getFieldError('روزهای ماموریت', form.missionDaysText)}
                />
                <NumericInput
                  id="salary-children"
                  label="تعداد فرزند"
                  value={form.numberOfChildrenText}
                  onValueChange={(value) => setForm((s) => ({ ...s, numberOfChildrenText: value }))}
                  error={getFieldError('تعداد فرزند', form.numberOfChildrenText)}
                />
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--color-primary)]"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                >
                  تنظیمات بیشتر (اختیاری)
                </button>
                {!showAdvanced && advancedSummary.length ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {advancedSummary.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/80 px-2 py-1 font-semibold text-[var(--text-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
                {showAdvanced ? (
                  <div className="mt-4 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={form.isMarried}
                          onChange={(e) => setForm((s) => ({ ...s, isMarried: e.target.checked }))}
                        />
                        متاهل هستم
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={form.hasWorkerCoupon}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, hasWorkerCoupon: e.target.checked }))
                          }
                        />
                        بن کارگری
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={form.hasTransportation}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, hasTransportation: e.target.checked }))
                          }
                        />
                        کمک هزینه حمل و نقل
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <input
                          type="checkbox"
                          checked={form.isDevelopmentZone}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, isDevelopmentZone: e.target.checked }))
                          }
                        />
                        منطقه توسعه یافته
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <MoneyInput
                        id="salary-other-benefits"
                        label="سایر مزایا (تومان)"
                        value={form.otherBenefitsText}
                        onValueChange={(value) => setForm((s) => ({ ...s, otherBenefitsText: value }))}
                        error={getFieldError('سایر مزایا', form.otherBenefitsText)}
                      />
                      <MoneyInput
                        id="salary-other-deductions"
                        label="سایر کسورات (تومان)"
                        value={form.otherDeductionsText}
                        onValueChange={(value) =>
                          setForm((s) => ({ ...s, otherDeductionsText: value }))
                        }
                        error={getFieldError('سایر کسورات', form.otherDeductionsText)}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <Button type="button" variant="secondary" onClick={() => setForm(initial)}>
                  بازنشانی فرم
                </Button>
                <Button type="button" onClick={onCalculate}>
                  محاسبه مجدد
                </Button>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.12)] px-4 py-2 text-xs font-semibold text-[var(--color-success)]">
                <span aria-hidden="true">🔒</span>
                محاسبات کاملاً در مرورگر شما انجام می‌شود و هیچ داده‌ای ارسال نمی‌شود.
              </div>
            </AnimatedCard>
          </div>
        </FadeIn>

        {/* Results Summary */}
        <AnimatePresence>
          {result && (
            <FadeIn delay={0.3}>
              <div className="max-w-6xl mx-auto">
                <AnimatedCard className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgb(var(--color-financial-rgb) / 0.1)' }}
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: toolCategories.financial.primary }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      نتیجه محاسبه حقوق
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ color: toolCategories.financial.primary }}
                    >
                      {showDetails ? 'مخفی کردن جزئیات' : 'نمایش جزئیات'}
                    </motion.button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-md mb-5"
                    onClick={saveSalaryResult}
                  >
                    ذخیره محاسبه
                  </button>

                  <div className="grid gap-6 md:grid-cols-3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-[var(--radius-lg)] p-6 border"
                      style={{
                        background: [
                          'linear-gradient(135deg,',
                          `${tokens.color.primaryScale[50]},`,
                          `${tokens.color.primaryScale[100]})`,
                        ].join(' '),
                        borderColor: tokens.color.primaryScale[200],
                      }}
                    >
                      <div
                        className="text-sm font-bold mb-2"
                        style={{ color: tokens.color.primaryScale[600] }}
                      >
                        حقوق ناخالص
                      </div>
                      <div
                        className="text-2xl font-black"
                        style={{ color: tokens.color.primaryScale[800] }}
                      >
                        {formatMoneyFa(result.grossSalary)} تومان
                      </div>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold"
                        style={{ color: tokens.color.primaryScale[700] }}
                        onClick={() =>
                          copyValue(`${formatMoneyFa(result.grossSalary)} تومان`, 'حقوق ناخالص')
                        }
                      >
                        Copy
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-[var(--radius-lg)] p-6 border"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(var(--color-danger-rgb) / 0.2), rgb(var(--color-danger-rgb) / 0.3))',
                        borderColor: 'rgb(var(--color-danger-rgb) / 0.4)',
                      }}
                    >
                      <div
                        className="text-sm font-bold mb-2"
                        style={{ color: tokens.color.status.error }}
                      >
                        مجموع کسورات
                      </div>
                      <div
                        className="text-2xl font-black"
                        style={{ color: tokens.color.status.error }}
                      >
                        {formatMoneyFa(result.summary.totalDeductions)} تومان
                      </div>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold"
                        style={{ color: tokens.color.status.error }}
                        onClick={() =>
                          copyValue(
                            `${formatMoneyFa(result.summary.totalDeductions)} تومان`,
                            'مجموع کسورات',
                          )
                        }
                      >
                        Copy
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-[var(--radius-lg)] p-6 border"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(var(--color-success-rgb) / 0.2), rgb(var(--color-success-rgb) / 0.3))',
                        borderColor: 'rgb(var(--color-success-rgb) / 0.4)',
                      }}
                    >
                      <div
                        className="text-sm font-bold mb-2"
                        style={{ color: tokens.color.status.success }}
                      >
                        حقوق خالص
                      </div>
                      <div
                        className="text-2xl font-black"
                        style={{ color: tokens.color.status.success }}
                      >
                        {formatMoneyFa(result.netSalary)} تومان
                      </div>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold"
                        style={{ color: tokens.color.status.success }}
                        onClick={() =>
                          copyValue(`${formatMoneyFa(result.netSalary)} تومان`, 'حقوق خالص')
                        }
                      >
                        Copy
                      </button>
                    </motion.div>
                  </div>
                </AnimatedCard>
              </div>
            </FadeIn>
          )}
        </AnimatePresence>

        {/* Minimum Wage Results */}
        <AnimatePresence>
          {minimumWageResult && (
            <FadeIn delay={0.3}>
              <div className="max-w-6xl mx-auto">
                <AnimatedCard className="p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[var(--color-success)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      نتیجه محاسبه حداقل دستمزد
                    </h2>
                    <button
                      type="button"
                      className="btn btn-primary btn-md"
                      onClick={saveMinimumWageResult}
                    >
                      ذخیره محاسبه
                    </button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-[var(--color-success)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        جزئیات حقوق
                      </h3>
                      <div className="space-y-3 bg-[var(--bg-subtle)] rounded-[var(--radius-md)] p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">حقوق پایه:</span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.baseSalary)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">
                            کمک هزینه مسکن:
                          </span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.housingAllowance)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">
                            کمک هزینه غذا:
                          </span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.foodAllowance)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">حق اولاد:</span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.familyAllowance)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">پاداش سابقه:</span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.experienceBonus)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-bold">مجموع حقوق ناخالص:</span>
                          <span className="text-sm font-bold text-[var(--color-success)]">
                            {formatMoneyFa(minimumWageResult.totalGross)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 text-xs font-semibold text-[var(--color-primary)]"
                        onClick={() =>
                          copyValue(
                            `حقوق پایه: ${formatMoneyFa(
                              minimumWageResult.baseSalary,
                            )}\nکمک هزینه مسکن: ${formatMoneyFa(
                              minimumWageResult.housingAllowance,
                            )}\nکمک هزینه غذا: ${formatMoneyFa(
                              minimumWageResult.foodAllowance,
                            )}\nحق اولاد: ${formatMoneyFa(
                              minimumWageResult.familyAllowance,
                            )}\nپاداش سابقه: ${formatMoneyFa(
                              minimumWageResult.experienceBonus,
                            )}\nمجموع حقوق ناخالص: ${formatMoneyFa(
                              minimumWageResult.totalGross,
                            )}\nبیمه: ${formatMoneyFa(
                              minimumWageResult.insuranceAmount,
                            )}\nمالیات: ${formatMoneyFa(
                              minimumWageResult.taxAmount,
                            )}\nحقوق خالص: ${formatMoneyFa(minimumWageResult.netSalary)}`,
                            'کپی همه حداقل دستمزد',
                          )
                        }
                      >
                        Copy All
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-[var(--color-success)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        کسورات و خالص
                      </h3>
                      <div className="space-y-3 bg-[var(--bg-subtle)] rounded-[var(--radius-md)] p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">بیمه:</span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.insuranceAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--text-secondary)]">مالیات:</span>
                          <span className="text-sm font-bold">
                            {formatMoneyFa(minimumWageResult.taxAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-bold text-[var(--color-success)]">
                            حقوق خالص:
                          </span>
                          <span className="text-sm font-bold text-[var(--color-success)]">
                            {formatMoneyFa(minimumWageResult.netSalary)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </FadeIn>
          )}
        </AnimatePresence>
      </div>
      {hasInteracted ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20">
          <SavedFinanceCalculations tool="salary" />
        </div>
      ) : null}
      {hasInteracted ? (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/90 px-4 py-3 shadow-[var(--shadow-strong)] backdrop-blur">
            <div className="text-xs text-[var(--text-muted)]">
              {form.mode === 'gross-to-net' && form.baseSalaryText
                ? `محاسبه حقوق خالص برای ${form.baseSalaryText} تومان`
                : form.mode === 'net-to-gross' && form.netSalaryText
                  ? `محاسبه حقوق پایه برای ${form.netSalaryText} تومان`
                  : 'برای شروع، مقدار حقوق را وارد کنید'}
            </div>
            <Button type="button" onClick={onCalculate}>
              محاسبه سریع
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
