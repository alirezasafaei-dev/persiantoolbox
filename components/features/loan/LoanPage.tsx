'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatMoneyFa, parseLooseNumber } from '@/shared/utils/numbers';
import { saveFinanceCalculation } from '@/shared/analytics/financeSaved';
import { calculateLoanResult } from '@/features/loan/loan.logic';
import type { LoanResult, LoanType, CalculationType } from '@/features/loan/loan.types';
import NumericInput from '@/shared/ui/NumericInput';
import { useToast } from '@/shared/ui/toast-context';
import AsyncState from '@/shared/ui/AsyncState';

const SavedFinanceCalculations = dynamic(
  () => import('@/components/features/finance/SavedFinanceCalculations'),
  { loading: () => null },
);
const ShareResult = dynamic(() => import('@/components/ui/ShareResult'), { loading: () => null });

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

const CALCULATION_TYPES: CalculationType[] = ['installment', 'rate', 'principal', 'months'];
const LOAN_TYPES: LoanType[] = ['regular', 'qarzolhasaneh', 'stepped'];

type LoanInputField = {
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
};

function getCalculationTypeLabel(type: CalculationType) {
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
}

function getLoanTypeLabel(type: LoanType) {
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
}

function getLoanTypeDescription(type: LoanType) {
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
}

function getPlaceholder(field: string) {
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
}

function getFieldError(label: string, value: string) {
  if (!value.trim()) {
    return undefined;
  }
  if (parseLooseNumber(value) === null) {
    return `${label} باید عدد معتبر باشد.`;
  }
  return undefined;
}

// Hoisted icon components to eliminate duplicate inline SVG literals across
// headers, buttons, result cards and table (reduces module parse/JS size and
// element creation cost in the main LoanPage chunk).
const IconCalc = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
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
);
const IconDoc = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
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
);
const IconBank = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
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
);
const IconChart = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
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
);
const IconTrend = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
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
);
const IconDownload = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export default function LoanPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<LoanFormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const updateForm = useCallback((patch: Partial<LoanFormState>) => {
    setHasInteracted(true);
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  // Stable per-field change handlers (same ref across renders) to reduce re-render churn
  // in NumericInput children during typing.
  const fieldChangeHandlers = useMemo(
    () => ({
      principal: (value: string) => updateForm({ principalText: value }),
      annualRate: (value: string) => updateForm({ annualRateText: value }),
      months: (value: string) => updateForm({ monthsText: value }),
      monthlyPayment: (value: string) => updateForm({ monthlyPaymentText: value }),
      stepMonths: (value: string) => updateForm({ stepMonthsText: value }),
      stepRateIncrease: (value: string) => updateForm({ stepRateIncreaseText: value }),
    }),
    [updateForm],
  );

  useEffect(() => {
    if (form.loanType === 'stepped') {
      setShowAdvanced(true);
    }
  }, [form.loanType, setShowAdvanced]);

  function onCalculate() {
    setHasInteracted(true);
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

  const inputFields = useMemo(() => {
    const fields: LoanInputField[] = [];

    switch (form.calculationType) {
      case 'installment':
        fields.push(
          {
            id: 'principal',
            label: 'مبلغ وام (تومان)',
            value: form.principalText,
            kind: 'money',
            onChange: fieldChangeHandlers.principal,
            placeholder: getPlaceholder('principal'),
            required: true,
          },
          {
            id: 'annualRate',
            label: 'نرخ سود سالانه (درصد)',
            value: form.annualRateText,
            kind: 'number',
            onChange: fieldChangeHandlers.annualRate,
            placeholder: getPlaceholder('annualRate'),
            required: true,
            ...(form.loanType === 'qarzolhasaneh' ? { max: '4', note: 'حداکثر 4%' } : {}),
          },
          {
            id: 'months',
            label: 'مدت بازپرداخت (ماه)',
            value: form.monthsText,
            kind: 'number',
            onChange: fieldChangeHandlers.months,
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
            onChange: fieldChangeHandlers.principal,
            placeholder: getPlaceholder('principal'),
            required: true,
          },
          {
            id: 'monthlyPayment',
            label: 'قسط ماهانه (تومان)',
            value: form.monthlyPaymentText,
            kind: 'money',
            onChange: fieldChangeHandlers.monthlyPayment,
            placeholder: getPlaceholder('monthlyPayment'),
            required: true,
          },
          {
            id: 'months',
            label: 'مدت بازپرداخت (ماه)',
            value: form.monthsText,
            kind: 'number',
            onChange: fieldChangeHandlers.months,
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
            onChange: fieldChangeHandlers.monthlyPayment,
            placeholder: getPlaceholder('monthlyPayment'),
            required: true,
          },
          {
            id: 'annualRate',
            label: 'نرخ سود سالانه (درصد)',
            value: form.annualRateText,
            kind: 'number',
            onChange: fieldChangeHandlers.annualRate,
            placeholder: getPlaceholder('annualRate'),
            required: true,
            ...(form.loanType === 'qarzolhasaneh' ? { max: '4', note: 'حداکثر 4%' } : {}),
          },
          {
            id: 'months',
            label: 'مدت بازپرداخت (ماه)',
            value: form.monthsText,
            kind: 'number',
            onChange: fieldChangeHandlers.months,
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
            onChange: fieldChangeHandlers.principal,
            placeholder: getPlaceholder('principal'),
            required: true,
          },
          {
            id: 'annualRate',
            label: 'نرخ سود سالانه (درصد)',
            value: form.annualRateText,
            kind: 'number',
            onChange: fieldChangeHandlers.annualRate,
            placeholder: getPlaceholder('annualRate'),
            required: true,
            ...(form.loanType === 'qarzolhasaneh' ? { max: '4', note: 'حداکثر 4%' } : {}),
          },
          {
            id: 'monthlyPayment',
            label: 'قسط ماهانه (تومان)',
            value: form.monthlyPaymentText,
            kind: 'money',
            onChange: fieldChangeHandlers.monthlyPayment,
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
          onChange: fieldChangeHandlers.stepMonths,
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
          onChange: fieldChangeHandlers.stepRateIncrease,
          placeholder: getPlaceholder('stepRateIncrease'),
          required: true,
          note: 'افزایش نرخ سود در هر مرحله',
          advanced: true,
        },
      );
    }

    return fields;
  }, [
    form.annualRateText,
    form.calculationType,
    form.loanType,
    form.monthlyPaymentText,
    form.monthsText,
    form.principalText,
    form.stepMonthsText,
    form.stepRateIncreaseText,
    fieldChangeHandlers,
  ]);
  const standardFields = useMemo(
    () => inputFields.filter((field) => !field.advanced),
    [inputFields],
  );
  const advancedFields = useMemo(
    () => inputFields.filter((field) => field.advanced),
    [inputFields],
  );

  return (
    <div className="min-h-screen">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div>
          <div className="text-center max-w-4xl mx-auto">
            <div className="financial-bg inline-flex items-center justify-center w-16 h-16 rounded-full text-white shadow-[var(--shadow-strong)] mb-6">
              <IconCalc className="w-8 h-8" />
            </div>
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
        </div>

        {/* Calculation Type Selection */}
        <div>
          <div className="max-w-6xl mx-auto">
            <div className="card p-8">
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="financial-soft-bg w-8 h-8 rounded-full flex items-center justify-center">
                  <IconDoc className="financial-text w-5 h-5" />
                </div>
                نوع محاسبه را انتخاب کنید
              </h2>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CALCULATION_TYPES.map((type) => (
                    <div key={type}>
                      <button
                        type="button"
                        aria-pressed={form.calculationType === type}
                        onClick={() => updateForm({ calculationType: type })}
                        className={[
                          'p-6 rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--motion-medium)] text-start',
                          form.calculationType === type
                            ? 'border-[#063a2f] bg-[#063a2f] text-white shadow-[var(--shadow-medium)]'
                            : 'border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]',
                        ].join(' ')}
                      >
                        <div className="text-lg font-bold mb-2">
                          {getCalculationTypeLabel(type)}
                        </div>
                        <div
                          className={`text-sm ${
                            form.calculationType === type
                              ? 'text-emerald-50'
                              : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {type === 'installment' && 'محاسبه بر اساس مبلغ وام'}
                          {type === 'rate' && 'محاسبه بر اساس قسط ماهانه'}
                          {type === 'principal' && 'محاسبه بر اساس قسط و نرخ'}
                          {type === 'months' && 'محاسبه بر اساس اقساط'}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Type Selection */}
        <div>
          <div className="max-w-6xl mx-auto">
            <div className="card p-8">
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                  <IconBank className="w-5 h-5 text-[var(--text-primary)]" />
                </div>
                نوع وام را انتخاب کنید
              </h2>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {LOAN_TYPES.map((type) => (
                    <div key={type}>
                      <button
                        type="button"
                        aria-pressed={form.loanType === type}
                        onClick={() => updateForm({ loanType: type })}
                        className={[
                          'p-6 rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--motion-medium)] text-start',
                          form.loanType === type
                            ? 'border-[#063a2f] bg-[#063a2f] text-white shadow-[var(--shadow-medium)]'
                            : 'border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]',
                        ].join(' ')}
                      >
                        <div className="font-bold text-lg mb-3">{getLoanTypeLabel(type)}</div>
                        <div
                          className={`text-sm leading-relaxed ${
                            form.loanType === type
                              ? 'text-emerald-50'
                              : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {getLoanTypeDescription(type)}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div>
          <div className="max-w-6xl mx-auto">
            <div className="card p-8">
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                  <IconDoc className="w-5 h-5 text-[var(--text-primary)]" />
                </div>
                مقادیر مورد نظر را وارد کنید
              </h2>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardFields.map((field) => (
                    <div key={field.id}>
                      <div className="space-y-3">
                        <label
                          htmlFor={field.id}
                          className="block text-sm font-bold text-slate-900"
                        >
                          {field.label}
                          {field.required ? (
                            <span className="text-[var(--color-danger)] me-1">*</span>
                          ) : null}
                        </label>
                        <NumericInput
                          id={field.id}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={field.placeholder}
                          error={getFieldError(field.label, field.value)}
                          helperText={field.note}
                          allowDecimal={field.kind !== 'money'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {advancedFields.length > 0 ? (
                <div className="mt-8">
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--color-primary)]"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    aria-expanded={showAdvanced}
                    aria-controls="advanced-fields"
                  >
                    تنظیمات بیشتر (اختیاری)
                  </button>
                  {showAdvanced ? (
                    <div
                      id="advanced-fields"
                      className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {advancedFields.map((field) => (
                        <div key={field.id} className="space-y-3">
                          <label
                            htmlFor={field.id}
                            className="block text-sm font-bold text-slate-900"
                          >
                            {field.label}
                            {field.required ? (
                              <span className="text-[var(--color-danger)] me-1">*</span>
                            ) : null}
                          </label>
                          <NumericInput
                            id={field.id}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={field.placeholder}
                            error={getFieldError(field.label, field.value)}
                            helperText={field.note}
                            allowDecimal={field.kind !== 'money'}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onCalculate}
                  className="btn btn-primary text-lg px-10 py-4"
                  aria-label="محاسبه اقساط وام"
                >
                  <span className="flex items-center gap-2">
                    <IconDoc className="w-5 h-5" />
                    محاسبه کن
                  </span>
                </button>
                {error ? (
                  <div>
                    <AsyncState
                      variant="error"
                      title="خطا در محاسبه"
                      description={error}
                      className="min-w-[18rem] border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.12)]"
                    />
                  </div>
                ) : null}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-xs font-semibold text-slate-900">
                <span aria-hidden="true">🔒</span>
                محاسبات کاملاً در مرورگر شما انجام می‌شود و هیچ داده‌ای ارسال نمی‌شود.
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div>
            <div className="max-w-6xl mx-auto">
              <div className="card p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                      <IconChart className="w-5 h-5 text-[var(--text-primary)]" />
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

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-[var(--shadow-medium)] bg-[rgb(var(--color-info-rgb)/0.12)]">
                        <div className="text-[var(--color-info)] text-sm font-bold mb-3 flex items-center gap-2">
                          <IconCalc className="w-5 h-5" />
                          قسط ماهانه
                        </div>
                        <div className="text-3xl font-black text-[var(--text-primary)]">
                          {formatMoneyFa(result.monthlyPayment)} تومان
                        </div>
                        <button
                          type="button"
                          className="mt-3 text-xs font-semibold text-[var(--color-info)]"
                          aria-label="کپی قسط ماهانه"
                          onClick={() =>
                            copyValue(`${formatMoneyFa(result.monthlyPayment)} تومان`, 'قسط ماهانه')
                          }
                        >
                          کپی
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-[var(--shadow-medium)] bg-[rgb(var(--color-success-rgb)/0.12)]">
                        <div className="text-[var(--color-success)] text-sm font-bold mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
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
                          aria-label="کپی مبلغ کل"
                          onClick={() =>
                            copyValue(`${formatMoneyFa(result.totalPayment)} تومان`, 'مبلغ کل')
                          }
                        >
                          کپی
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-[var(--shadow-medium)] bg-[rgb(var(--color-warning-rgb)/0.12)]">
                        <div className="text-[var(--color-warning)] text-sm font-bold mb-3 flex items-center gap-2">
                          <IconCalc className="w-5 h-5" />
                          سود کل
                        </div>
                        <div className="text-3xl font-black text-[var(--text-primary)]">
                          {formatMoneyFa(result.totalInterest)} تومان
                        </div>
                        <button
                          type="button"
                          className="mt-3 text-xs font-semibold text-[var(--color-warning)]"
                          aria-label="کپی سود کل"
                          onClick={() =>
                            copyValue(`${formatMoneyFa(result.totalInterest)} تومان`, 'سود کل')
                          }
                        >
                          کپی
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {result.effectiveRate !== undefined ? (
                  <div className="bg-[var(--bg-subtle)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-light)] mb-8 shadow-[var(--shadow-medium)]">
                    <div className="text-[var(--color-primary)] text-sm font-bold mb-2 flex items-center gap-2">
                      <IconTrend className="w-5 h-5" />
                      نرخ موثر سالانه
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">
                      {result.effectiveRate.toFixed(2)}%
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-xs font-semibold text-[var(--color-primary)]"
                      aria-label="کپی نرخ موثر سالانه"
                      onClick={() =>
                        copyValue(`${result.effectiveRate?.toFixed(2)}%`, 'نرخ موثر سالانه')
                      }
                    >
                      کپی
                    </button>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const rows = [
                        ['قسط ماهانه', `${formatMoneyFa(result.monthlyPayment)} تومان`],
                        ['مبلغ کل بازپرداخت', `${formatMoneyFa(result.totalPayment)} تومان`],
                        ['سود کل', `${formatMoneyFa(result.totalInterest)} تومان`],
                      ];
                      if (result.effectiveRate !== undefined) {
                        rows.push(['نرخ موثر سالانه', `${result.effectiveRate.toFixed(2)}%`]);
                      }
                      const csv = `\uFEFF${rows.map((r) => r.join(',')).join('\n')}`;
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'نتیجه-محاسبه-وام.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:brightness-110 shadow-[var(--shadow-medium)]"
                  >
                    <IconDownload className="w-4 h-4" />
                    دانلود نتیجه (CSV)
                  </button>
                  <ShareResult
                    title={`نتیجه محاسبه وام ${getLoanTypeLabel(form.loanType)}`}
                    text={`قسط ماهانه: ${formatMoneyFa(result.monthlyPayment)} تومان | سود کل: ${formatMoneyFa(result.totalInterest)} تومان | مبلغ کل: ${formatMoneyFa(result.totalPayment)} تومان`}
                  />
                </div>
                {result.stepDetails ? (
                  <div className="bg-[var(--bg-subtle)] p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)]">
                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                      <IconChart className="w-6 h-6" />
                      جزئیات اقساط پلکانی
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <caption className="sr-only">جزئیات اقساط پلکانی وام</caption>
                        <thead>
                          <tr className="border-b border-[var(--border-light)]">
                            <th
                              scope="col"
                              className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]"
                            >
                              مرحله
                            </th>
                            <th
                              scope="col"
                              className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]"
                            >
                              تعداد ماه
                            </th>
                            <th
                              scope="col"
                              className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]"
                            >
                              نرخ سود
                            </th>
                            <th
                              scope="col"
                              className="text-start pb-4 text-sm font-bold text-[var(--text-primary)]"
                            >
                              قسط ماهانه
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.stepDetails.map((step) => (
                            <tr
                              key={step.step}
                              className="border-b border-[var(--border-light)] hover:bg-[var(--bg-subtle)] transition-colors"
                            >
                              <td className="py-4 text-sm font-semibold">{step.step}</td>
                              <td className="py-4 text-sm">{step.months}</td>
                              <td className="py-4 text-sm font-bold">{step.rate.toFixed(1)}%</td>
                              <td className="py-4 text-sm font-bold">
                                {formatMoneyFa(step.monthlyPayment)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
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
