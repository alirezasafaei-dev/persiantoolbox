import type { LoanInput, LoanResult, StepDetail } from './loan.types';
import { fromError, ok, type ToolResult } from '@/shared/utils/result';

const MAX_RATE = 200;

function clampRate(rate: number, loanType: LoanInput['loanType']): number {
  if (loanType === 'qarzolhasaneh') {
    return Math.min(rate, 4);
  }
  return rate;
}

function paymentForRate(principal: number, annualRate: number, months: number): number {
  if (months <= 0) {
    throw new Error('مدت بازپرداخت باید بیشتر از صفر باشد.');
  }
  if (principal <= 0) {
    throw new Error('مبلغ وام باید بیشتر از صفر باشد.');
  }

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / months;
  }

  const pow = Math.pow(1 + monthlyRate, months);
  return (principal * (monthlyRate * pow)) / (pow - 1);
}

function solveRateFromPayment(principal: number, months: number, monthlyPayment: number): number {
  if (monthlyPayment <= 0) {
    throw new Error('قسط ماهانه باید بیشتر از صفر باشد.');
  }

  let low = 0;
  let high = MAX_RATE;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const payment = paymentForRate(principal, mid, months);

    if (payment > monthlyPayment) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}

function solvePrincipalFromPayment(
  monthlyPayment: number,
  annualRate: number,
  months: number,
): number {
  if (monthlyPayment <= 0) {
    throw new Error('قسط ماهانه باید بیشتر از صفر باشد.');
  }
  if (months <= 0) {
    throw new Error('مدت بازپرداخت باید بیشتر از صفر باشد.');
  }

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }

  const pow = Math.pow(1 + monthlyRate, months);
  return (monthlyPayment * (pow - 1)) / (monthlyRate * pow);
}

function solveMonthsFromPayment(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
): number {
  if (principal <= 0) {
    throw new Error('مبلغ وام باید بیشتر از صفر باشد.');
  }
  if (monthlyPayment <= 0) {
    throw new Error('قسط ماهانه باید بیشتر از صفر باشد.');
  }

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / monthlyPayment;
  }

  const ratio = monthlyPayment / (monthlyPayment - principal * monthlyRate);
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new Error('ورودی‌ها باعث محاسبه نامعتبر شدند.');
  }

  return Math.log(ratio) / Math.log(1 + monthlyRate);
}

function buildStepDetails(
  principal: number,
  months: number,
  annualRate: number,
  stepMonths: number,
  stepRateIncrease: number,
): StepDetail[] {
  if (stepMonths <= 0) {
    throw new Error('تعداد ماه هر مرحله باید بیشتر از صفر باشد.');
  }

  const steps = Math.max(1, Math.ceil(months / stepMonths));
  const details: StepDetail[] = [];

  for (let i = 0; i < steps; i += 1) {
    const rate = annualRate + i * stepRateIncrease;
    const monthsInStep = i === steps - 1 ? months - stepMonths * (steps - 1) : stepMonths;
    details.push({
      step: i + 1,
      months: Math.max(1, monthsInStep),
      rate,
      monthlyPayment: paymentForRate(principal, rate, months),
    });
  }

  return details;
}

export function calculateLoan(input: LoanInput): LoanResult {
  const baseRate = clampRate(input.annualInterestRatePercent, input.loanType);
  let rate = baseRate;
  let principal = input.principal;
  let months = input.months;

  if (!Number.isFinite(principal) || principal < 0) {
    throw new Error('مبلغ وام نامعتبر است.');
  }
  if (!Number.isFinite(months) || months < 0) {
    throw new Error('مدت بازپرداخت نامعتبر است.');
  }

  let stepDetails: StepDetail[] | undefined;
  if (input.loanType === 'stepped') {
    stepDetails = buildStepDetails(
      principal,
      months,
      baseRate,
      input.stepMonths ?? 0,
      input.stepRateIncrease ?? 0,
    );
    const steps = stepDetails.length;
    rate = baseRate + ((steps - 1) * (input.stepRateIncrease ?? 0)) / 2;
  }

  let monthlyPayment: number;

  switch (input.calculationType) {
    case 'installment':
      monthlyPayment = paymentForRate(principal, rate, months);
      break;
    case 'rate':
      if (!input.monthlyPayment) {
        throw new Error('قسط ماهانه برای محاسبه نرخ لازم است.');
      }
      rate = solveRateFromPayment(principal, months, input.monthlyPayment);
      monthlyPayment = input.monthlyPayment;
      break;
    case 'principal':
      if (!input.monthlyPayment) {
        throw new Error('قسط ماهانه برای محاسبه مبلغ وام لازم است.');
      }
      principal = solvePrincipalFromPayment(input.monthlyPayment, rate, months);
      monthlyPayment = input.monthlyPayment;
      break;
    case 'months':
      if (!input.monthlyPayment) {
        throw new Error('قسط ماهانه برای محاسبه مدت لازم است.');
      }
      months = Math.ceil(solveMonthsFromPayment(principal, rate, input.monthlyPayment));
      monthlyPayment = input.monthlyPayment;
      break;
    default:
      throw new Error('نوع محاسبه نامعتبر است.');
  }

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  const result: LoanResult = {
    principal,
    months,
    annualInterestRatePercent: rate,
    monthlyPayment,
    totalPayment,
    totalInterest,
  };

  if (Number.isFinite(rate)) {
    result.effectiveRate = rate;
  }

  if (stepDetails) {
    result.stepDetails = stepDetails;
  }

  return result;
}

export function calculateLoanResult(input: LoanInput): ToolResult<LoanResult> {
  try {
    return ok(calculateLoan(input));
  } catch (error) {
    return fromError(error, 'خطای نامشخص در محاسبه وام.', 'LOAN_CALCULATION_ERROR');
  }
}
