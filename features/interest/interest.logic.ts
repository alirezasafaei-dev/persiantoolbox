import { calculateCompoundInterest } from '@/shared/utils/finance';
import { fromError, ok, type ToolResult } from '@/shared/utils/result';

export type InterestMode = 'simple' | 'compound';

export type InterestInput = {
  principal: number;
  annualRatePercent: number;
  months: number;
  mode: InterestMode;
  timesPerYear?: number;
};

export type InterestResult = {
  principal: number;
  annualRatePercent: number;
  months: number;
  mode: InterestMode;
  interest: number;
  finalAmount: number;
  monthlyProfit: number;
};

function normalizePositiveNumber(input: number, label: string): number {
  if (!Number.isFinite(input)) {
    throw new Error(`${label} نامعتبر است.`);
  }
  if (input < 0) {
    throw new Error(`${label} نمی‌تواند منفی باشد.`);
  }
  return input;
}

export function calculateInterest(input: InterestInput): InterestResult {
  const principal = normalizePositiveNumber(input.principal, 'مبلغ سپرده');
  const annualRatePercent = normalizePositiveNumber(input.annualRatePercent, 'نرخ سود');
  const months = normalizePositiveNumber(input.months, 'مدت');

  if (months <= 0) {
    throw new Error('مدت سپرده‌گذاری باید بیشتر از صفر باشد.');
  }

  let interest: number;
  let finalAmount: number;

  if (input.mode === 'compound') {
    const compound = calculateCompoundInterest({
      principal,
      annualRatePercent,
      years: months / 12,
      timesPerYear: input.timesPerYear ?? 12,
    });
    interest = compound.interest;
    finalAmount = compound.total;
  } else {
    interest = principal * (annualRatePercent / 100) * (months / 12);
    finalAmount = principal + interest;
  }

  return {
    principal,
    annualRatePercent,
    months,
    mode: input.mode,
    interest,
    finalAmount,
    monthlyProfit: interest / months,
  };
}

export function calculateInterestResult(input: InterestInput): ToolResult<InterestResult> {
  try {
    return ok(calculateInterest(input));
  } catch (error) {
    return fromError(error, 'خطای نامشخص در محاسبه سود سپرده.', 'INTEREST_CALCULATION_ERROR');
  }
}
