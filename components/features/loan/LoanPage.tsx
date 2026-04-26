'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SavedFinanceCalculations from '@/components/features/finance/SavedFinanceCalculations';
import { formatMoneyFa, parseLooseNumber } from '@/shared/utils/numbers';
import { saveFinanceCalculation } from '@/shared/analytics/financeSaved';
import { calculateLoanResult } from '@/features/loan/loan.logic';
import type { LoanResult, LoanType, CalculationType } from '@/features/loan/loan.types';
import MoneyInput from '@/shared/ui/MoneyInput';
import NumericInput from '@/shared/ui/NumericInput';
import {
  AnimatedCard,
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from '@/shared/ui/AnimatedComponents';
import { useToast } from '@/shared/ui/toast-context';
import AsyncState from '@/shared/ui/AsyncState';

type LoanFormState = {
  calculationType: CalculationType;
  loanType: LoanType;
  principalText: string;
  annualRateText: string;
  monthsText: string;
  monthlyPaymentText: string;
  stepMonthsText: string;
  stepRateIncreaseText: string;
};

const defaultForm: LoanFormState = {
  calculationType: 'installment',
  loanType: 'regular',
  principalText: '',
  annualRateText: '',
  monthsText: '',
  monthlyPaymentText: '',
  stepMonthsText: '',
  stepRateIncreaseText: '',
};

export default function LoanPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<LoanFormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const initialRef = useMemo(() => JSON.stringify(defaultForm), []);

  useEffect(() => {
    if (hasInteracted) {
      return;
    }
    if (JSON.stringify(form) !== initialRef) {
      setHasInteracted(true);
    }
  }, [form, hasInteracted, initialRef]);

  useEffect(() => {
    if (form.loanType === 'stepped') {
      setShowAdvanced(true);
    }
  }, [form.loanType]);

  function onCalculate() {
    setError(null);
    setResult(null);

    const principal = parseLooseNumber(form.principalText);
    const annualRate = parseLooseNumber(form.annualRateText);
    const months = parseLooseNumber(form.monthsText);
    const monthlyPayment = parseLooseNumber(form.monthlyPaymentText);
    const stepMonths = parseLooseNumber(form.stepMonthsText);
    const stepRateIncrease = parseLooseNumber(form.stepRateIncreaseText);

    const result = calculateLoanResult({
      principal: principal ?? 0,
      annualInterestRatePercent: annualRate ?? 0,
      months: Math.trunc(months ?? 0),
      loanType: form.loanType,
      calculationType: form.calculationType,
      ...(monthlyPayment !== null ? { monthlyPayment } : {}),
      stepMonths: form.loanType === 'stepped' ? Math.trunc(stepMonths ?? 0) : 0,
      stepRateIncrease: form.loanType === 'stepped' ? (stepRateIncrease ?? 0) : 0,
    });

    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setResult(result.data);
  }

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

  const onSaveCalculation = () => {
    if (!result) {
      return;
    }
    saveFinanceCalculation({
      tool: 'loan',
      title: `سناریوی وام ${getLoanTypeLabel(form.loanType)}`,
      summary: `قسط: ${formatMoneyFa(result.monthlyPayment)} تومان | سود کل: ${formatMoneyFa(
        result.totalInterest,
      )} تومان`,
    });
    showToast('نتیجه وام در مرورگر ذخیره شد', 'success');
  };

  const getCalculationTypeLabel = (type: CalculationType) => {
    switch (type) {
      case 'installment':
        return 'محاسبه قسط ماهانه';
      case 'rate':
        return 'محاسبه نرخ سود';
      case 'principal':
        return 'محاسبه مبلغ وام';
      case 'months':
        return 'محاسبه مدت بازپرداخت';
      default:
        return type;
    }
  };

  const getLoanTypeLabel = (type: LoanType) => {
    switch (type) {
      case 'regular':
        return 'عادی';
      case 'qarzolhasaneh':
        return 'قرض‌الحسنه';
      case 'stepped':
        return 'اقساط پلکانی';
      default:
        return type;
    }
  };

  const getLoanTypeDescription = (type: LoanType) => {
    switch (type) {
      case 'regular':
        return 'وام با اقساط مساوی و نرخ سود ثابت';
      case 'qarzolhasaneh':
        return 'وام با نرخ سود بسیار پایین (حداکثر 4%)';
      case 'stepped':
        return 'وام با اقساط متغیر و نرخ سود افزایشی';
      default:
        return '';
    }
  };

  const getPlaceholder = (field: string) => {
    switch (field) {
      case 'principal':
        return 'مثال: ۲۰,۰۰۰,۰۰۰';
      case 'annualRate':
        return 'مثال: ۲۳';
      case 'months':
        return 'مثال: ۳۶';
      case 'monthlyPayment':
        return 'مثال: ۵,۰۰۰,۰۰۰';
      case 'stepMonths':
        return 'مثال: ۱۲';
      case 'stepRateIncrease':
        return 'مثال: ۲';
      default:
        return '';
    }
  };

  const getInputFields = () => {
    const fields: Array<{
      id: string;
      label: string;
      value: string;
      kind: 'money' | 'number';
      onChange: (value: string) => void;
      placeholder?: string;
      required?: boolean;
      max?: string;
      note?: string;
      advanced?: boolean;
    }> = [];

    switch (form.calculationType) {
      case 'installment':
        fields.push(
          {
            id: 'principal',
            label: 'مبلغ وام (تومان)',
            value: form.principalText,
            kind: 'money',
            onChange: (value: string) => setForm((s) => ({ ...s, principalText: value })),
            placeholder: getPlaceholder('principal'),
            required: true,
          },
          {
            id: 'annualRate',
            label: 'نرخ سود سالانه (درصد)',
            value: form.annualRateText,
            kind: 'number',
            onChange: (value: string) => setForm((s) => ({ ...s, annualRateText: value })),
            placeholder: getPlaceholder('annualRate'),
            required: true,
            ...(form.loanType === 'qarzolhasaneh' ? { max: '4', note: 'حداکثر 4%' } : {}),
          },
          {
            id: 'months',
            label: 'مدت بازپرداخت (ماه)',
            value: form.monthsText,
            kind: 'number',
            onChange: (value: string) => setForm((s) => ({ ...s, monthsText: value })),
            placeholder: getPlaceholder('months'),
            required: true,
          },
        );
        break;

      case 'rate':
        fields.push(
          {
            id: 'principal',
            label: 'مبلغ وام (تومان)',
            value: form.principalText,
            kind: 'money',
            onChange: (value: string) => setForm((s) => ({ ...s, principalText: value })),
            placeholder: getPlaceholder('principal'),
            required: true,
          },
          {
            id: 'monthlyPayment',
            label: 'قسط ماهانه (تومان)',
            value: form.monthlyPaymentText,
            kind: 'money',
            onChange: (value: string) => setForm((s) => ({ ...s, monthlyPaymentText: value })),
            placeholder: getPlaceholder('monthlyPayment'),
            required: true,
          },
          {
            id: 'months',
            label: 'مدت بازپرداخت (ماه)',
            value: form.monthsText,
            kind: 'number',
            onChange: (value: string) => setForm((s) => ({ ...s, monthsText: value })),
            placeholder: getPlaceholder('months'),
            required: true,
          },
        );
        break;

      case 'principal':
        fields.push(
          {
            id: 'monthlyPayment',
            label: 'قسط ماهانه (تومان)',
            value: form.monthlyPaymentText,
            kind: 'money',
            onChange: (value: string) => setForm((s) => ({ ...s, monthlyPaymentText: value })),
            placeholder: getPlaceholder('monthlyPayment'),
            required: true,
          },
          {
            id: 'annualRate',
            label: 'نرخ سود سالانه (درصد)',
            value: form.annualRateText,
            kind: 'number',
            onChange: (value: string) => setForm((s) => ({ ...s, annualRateText: value })),
            placeholder: getPlaceholder('annualRate'),
            required: true,
            ...(form.loanType === 'qarzolhasaneh' ? { max: '4', note: 'حداکثر 4%' } : {}),
          },
          {
            id: 'months',
            label: 'مدت بازپرداخت (ماه)',
            value: form.monthsText,
            kind: 'number',
            onChange: (value: string) => setForm((s) => ({ ...s, monthsText: value })),
            placeholder: getPlaceholder('months'),
            required: true,
          },
        );
        break;

      case 'months':
        fields.push(
          {
            id: 'principal',
            label: 'مبلغ وام (تومان)',
            value: form.principalText,
            kind: 'money',
            onChange: (value: string) => setForm((s) => ({ ...s, principalText: value })),
            placeholder: getPlaceholder('principal'),
            required: true,
          },
          {
            id: 'annualRate',
            label: 'نرخ سود سالانه (درصد)',
            value: form.annualRateText,
            kind: 'number',
            onChange: (value: string) => setForm((s) => ({ ...s, annualRateText: value })),
            placeholder: getPlaceholder('annualRate'),
            required: true,
            ...(form.loanType === 'qarzolhasaneh' ? { max: '4', note: 'حداکثر 4%' } : {}),
          },
          {
            id: 'monthlyPayment',
            label: 'قسط ماهانه (تومان)',
            value: form.monthlyPaymentText,
            kind: 'money',
            onChange: (value: string) => setForm((s) => ({ ...s, monthlyPaymentText: value })),
            placeholder: getPlaceholder('monthlyPayment'),
            required: true,
          },
        );
        break;
    }

    // Add stepped loan specific fields
    if (form.loanType === 'stepped' && form.calculationType === 'installment') {
      fields.push(
        {
          id: 'stepMonths',
          label: 'تعداد ماه هر مرحله',
          value: form.stepMonthsText,
          kind: 'number',
          onChange: (value: string) => setForm((s) => ({ ...s, stepMonthsText: value })),
          placeholder: getPlaceholder('stepMonths'),
          required: true,
          note: 'تعداد ماه‌های هر مرحله از اقساط پلکانی',
          advanced: true,
        },
        {
          id: 'stepRateIncrease',
          label: 'افزایش نرخ هر مرحله (درصد)',
          value: form.stepRateIncreaseText,
          kind: 'number',
          onChange: (value: string) => setForm((s) => ({ ...s, stepRateIncreaseText: value })),
          placeholder: getPlaceholder('stepRateIncrease'),
          required: true,
          note: 'افزایش نرخ سود در هر مرحله',
          advanced: true,
        },
      );
    }

    return fields;
  };

  const getFieldError = (label: string, value: string) => {
    if (!value.trim()) {
      return undefined;
    }
    if (parseLooseNumber(value) === null) {
      return `${label} باید عدد معتبر باشد.`;
    }
    return undefined;
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-8 p-6">
        {/* Header */}
        <FadeIn delay={0}>
          <div className="text-center max-w-4xl mx-auto">
            <motion.div className="financial-bg inline-flex items-center justify-center w-16 h-16 rounded-full text-white shadow-[var(--shadow-strong)] mb-6">
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
              محاسبه‌گر اقساط و سود وام بانکی
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              {'این محاسبه‌گر بر اساس فرمول‌های جدید بانک مرکزی عمل می‌کند '}
              {'و برای انواع وام‌های بانکی مناسب است.'}{' '}
              {'دامنه محاسبات شامل وام‌های عادی، قرض‌الحسنه '}
              {'و وام با اقساط پلکانی می‌باشد.'}
            </p>
          </div>
        </FadeIn>

        {/* Calculation Type Selection */}
        <FadeIn delay={0.1}>
          <div className="max-w-6xl mx-auto">
            <AnimatedCard className="p-8">
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="financial-soft-bg w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    className="financial-text w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M9 11h.01M12 11h.01M15 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                نوع محاسبه را انتخاب کنید
              </h2>
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['installment', 'rate', 'principal', 'months'] as CalculationType[]).map(
                    (type) => (
                      <StaggerItem key={type}>
                        <motion.button
                          type="button"
                          aria-pressed={form.calculationType === type}
                          onClick={() => setForm((s) => ({ ...s, calculationType: type }))}
                          className={[
                            'p-6 rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--motion-medium)] text-start',
                            form.calculationType === type
                              ? 'border-[#063a2f] bg-[#063a2f] text-white shadow-[var(--shadow-medium)]'
                              : 'border-[var(--border-light)] bg-[var(--surface-1)] text-slate-900 hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]',
                          ].join(' ')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-lg font-bold mb-2">
                            {getCalculationTypeLabel(type)}
                          </div>
                          <div
                            className={`text-sm ${
                              form.calculationType === type ? 'text-emerald-50' : 'text-slate-700'
                            }`}
                          >
                            {type === 'installment' && 'محاسبه بر اساس مبلغ وام'}
                            {type === 'rate' && 'محاسبه بر اساس قسط ماهانه'}
                            {type === 'principal' && 'محاسبه بر اساس قسط و نرخ'}
                            {type === 'months' && 'محاسبه بر اساس اقساط'}
                          </div>
                        </motion.button>
                      </StaggerItem>
                    ),
                  )}
                </div>
              </StaggerContainer>
            </AnimatedCard>
          </div>
        </FadeIn>

        {/* Loan Type Selection */}
        <FadeIn delay={0.2}>
          <div className="max-w-6xl mx-auto">
            <AnimatedCard className="p-8">
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[var(--text-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                نوع وام را انتخاب کنید
              </h2>
              <StaggerContainer staggerDelay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(['regular', 'qarzolhasaneh', 'stepped'] as LoanType[]).map((type) => (
                    <StaggerItem key={type}>
                      <motion.button
                        type="button"
                        aria-pressed={form.loanType === type}
                        onClick={() => setForm((s) => ({ ...s, loanType: type }))}
                        className={[
                          'p-6 rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--motion-medium)] text-start',
                          form.loanType === type
                            ? 'border-[#063a2f] bg-[#063a2f] text-white shadow-[var(--shadow-medium)]'
                            : 'border-[var(--border-light)] bg-[var(--surface-1)] text-slate-900 hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]',
                        ].join(' ')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-bold text-lg mb-3">{getLoanTypeLabel(type)}</div>
                        <div
                          className={`text-sm leading-relaxed ${
                            form.loanType === type ? 'text-emerald-50' : 'text-slate-700'
                          }`}
                        >
                          {getLoanTypeDescription(type)}
                        </div>
                      </motion.button>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </AnimatedCard>
          </div>
        </FadeIn>

        {/* Input Form */}
        <FadeIn delay={0.3}>
          <div className="max-w-6xl mx-auto">
            <AnimatedCard className="p-8">
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[var(--text-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                مقادیر مورد نظر را وارد کنید
              </h2>
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getInputFields()
                    .filter((field) => !field.advanced)
                    .map((field) => (
                      <StaggerItem key={field.id}>
                        <div className="space-y-3">
                          <label
                            htmlFor={field.id}
                            className="block text-sm font-bold text-slate-900"
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-[var(--color-danger)] me-1">*</span>
                            )}
                          </label>
                          {field.kind === 'money' ? (
                            <MoneyInput
                              id={field.id}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={field.placeholder}
                              error={getFieldError(field.label, field.value)}
                              helperText={field.note}
                            />
                          ) : (
                            <NumericInput
                              id={field.id}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={field.placeholder}
                              error={getFieldError(field.label, field.value)}
                              helperText={field.note}
                            />
                          )}
                        </div>
                      </StaggerItem>
                    ))}
                </div>
              </StaggerContainer>

              {getInputFields().some((field) => field.advanced) ? (
                <div className="mt-8">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--color-primary)]"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                  >
                    تنظیمات بیشتر (اختیاری)
                  </button>
                  {showAdvanced ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getInputFields()
                        .filter((field) => field.advanced)
                        .map((field) => (
                          <div key={field.id} className="space-y-3">
                            <label
                              htmlFor={field.id}
                              className="block text-sm font-bold text-slate-900"
                            >
                              {field.label}
                              {field.required && (
                                <span className="text-[var(--color-danger)] me-1">*</span>
                              )}
                            </label>
                            {field.kind === 'money' ? (
                              <MoneyInput
                                id={field.id}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={field.placeholder}
                                error={getFieldError(field.label, field.value)}
                                helperText={field.note}
                              />
                            ) : (
                              <NumericInput
                                id={field.id}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={field.placeholder}
                                error={getFieldError(field.label, field.value)}
                                helperText={field.note}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between">
                <motion.button
                  type="button"
                  onClick={onCalculate}
                  className="btn btn-primary text-lg px-10 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M9 11h.01M12 11h.01M15 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    محاسبه کن
                  </span>
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <AsyncState
                        variant="error"
                        title="خطا در محاسبه"
                        description={error}
                        className="min-w-[18rem] border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.12)]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-xs font-semibold text-slate-900">
                <span aria-hidden="true">🔒</span>
                محاسبات کاملاً در مرورگر شما انجام می‌شود و هیچ داده‌ای ارسال نمی‌شود.
              </div>
            </AnimatedCard>
          </div>
        </FadeIn>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-6xl mx-auto">
                <AnimatedCard className="p-8">
                  <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[var(--text-primary)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      نتیجه محاسبه - وام {getLoanTypeLabel(form.loanType)}
                    </h2>
                    <button
                      type="button"
                      className="btn btn-primary btn-md"
                      onClick={onSaveCalculation}
                    >
                      ذخیره محاسبه
                    </button>
                  </div>

                  <StaggerContainer staggerDelay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <StaggerItem>
                        <motion.div
                          className="p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-[var(--shadow-medium)] bg-[rgb(var(--color-info-rgb)/0.12)]"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-[var(--color-info)] text-sm font-bold mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
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
                            قسط ماهانه
                          </div>
                          <div className="text-3xl font-black text-[var(--text-primary)]">
                            {formatMoneyFa(result.monthlyPayment)} تومان
                          </div>
                          <button
                            type="button"
                            className="mt-3 text-xs font-semibold text-[var(--color-info)]"
                            onClick={() =>
                              copyValue(
                                `${formatMoneyFa(result.monthlyPayment)} تومان`,
                                'قسط ماهانه',
                              )
                            }
                          >
                            Copy
                          </button>
                        </motion.div>
                      </StaggerItem>

                      <StaggerItem>
                        <motion.div
                          className="p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-[var(--shadow-medium)] bg-[rgb(var(--color-success-rgb)/0.12)]"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-[var(--color-success)] text-sm font-bold mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            مبلغ کل
                          </div>
                          <div className="text-3xl font-black text-[var(--text-primary)]">
                            {formatMoneyFa(result.totalPayment)} تومان
                          </div>
                          <button
                            type="button"
                            className="mt-3 text-xs font-semibold text-[var(--color-success)]"
                            onClick={() =>
                              copyValue(`${formatMoneyFa(result.totalPayment)} تومان`, 'مبلغ کل')
                            }
                          >
                            Copy
                          </button>
                        </motion.div>
                      </StaggerItem>

                      <StaggerItem>
                        <motion.div
                          className="p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-[var(--shadow-medium)] bg-[rgb(var(--color-warning-rgb)/0.12)]"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="text-[var(--color-warning)] text-sm font-bold mb-3 flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
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
                            سود کل
                          </div>
                          <div className="text-3xl font-black text-[var(--text-primary)]">
                            {formatMoneyFa(result.totalInterest)} تومان
                          </div>
                          <button
                            type="button"
                            className="mt-3 text-xs font-semibold text-[var(--color-warning)]"
                            onClick={() =>
                              copyValue(`${formatMoneyFa(result.totalInterest)} تومان`, 'سود کل')
                            }
                          >
                            Copy
                          </button>
                        </motion.div>
                      </StaggerItem>
                    </div>
                  </StaggerContainer>

                  <AnimatePresence>
                    {result.effectiveRate !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-[var(--bg-subtle)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-light)] mb-8 shadow-[var(--shadow-medium)]"
                      >
                        <div className="text-[var(--color-primary)] text-sm font-bold mb-2 flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          نرخ موثر سالانه
                        </div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">
                          {result.effectiveRate.toFixed(2)}%
                        </div>
                        <button
                          type="button"
                          className="mt-3 text-xs font-semibold text-[var(--color-primary)]"
                          onClick={() =>
                            copyValue(`${result.effectiveRate?.toFixed(2)}%`, 'نرخ موثر سالانه')
                          }
                        >
                          Copy
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {result.stepDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-[var(--bg-subtle)] p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)]"
                      >
                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          جزئیات اقساط پلکانی
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[var(--border-light)]">
                                <th className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]">
                                  مرحله
                                </th>
                                <th className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]">
                                  تعداد ماه
                                </th>
                                <th className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]">
                                  نرخ سود
                                </th>
                                <th className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]">
                                  قسط ماهانه
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.stepDetails.map((step, index) => (
                                <motion.tr
                                  key={step.step}
                                  className="border-b border-[var(--border-light)] hover:bg-[var(--bg-subtle)] transition-colors"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                >
                                  <td className="py-4 text-sm font-semibold">{step.step}</td>
                                  <td className="py-4 text-sm">{step.months}</td>
                                  <td className="py-4 text-sm font-bold">
                                    {step.rate.toFixed(1)}%
                                  </td>
                                  <td className="py-4 text-sm font-bold">
                                    {formatMoneyFa(step.monthlyPayment)}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AnimatedCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {hasInteracted ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20">
          <SavedFinanceCalculations tool="loan" />
        </div>
      ) : null}
      {hasInteracted ? (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/90 px-4 py-3 shadow-[var(--shadow-strong)] backdrop-blur">
            <div className="text-xs text-[var(--text-muted)]">
              {form.principalText
                ? `محاسبه وام برای ${form.principalText} تومان`
                : 'برای شروع، مبلغ وام را وارد کنید'}
            </div>
            <button type="button" className="btn btn-primary btn-md" onClick={onCalculate}>
              محاسبه سریع
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
