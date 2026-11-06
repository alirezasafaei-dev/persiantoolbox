import { getSalaryLaws } from './salary.laws';

/** A regular employee's monthly estimate, not cumulative annual payroll settlement. */
export function calculateMonthlySalaryTax(taxableIncome: number): number {
  if (!Number.isFinite(taxableIncome) || taxableIncome <= 0) {
    return 0;
  }
  let tax = 0;
  let previousLimit = 0;
  for (const bracket of getSalaryLaws().taxBrackets) {
    const upperLimit = bracket.upTo ?? Number.POSITIVE_INFINITY;
    tax += Math.max(0, Math.min(taxableIncome, upperLimit) - previousLimit) * bracket.rate;
    previousLimit = upperLimit;
  }
  return tax;
}

export function calculateMonthlyDeductions(params: {
  gross: number;
  insuranceExempt?: number;
  taxExempt?: number;
  insuredDays?: number;
}) {
  const laws = getSalaryLaws();
  const requestedDays = params.insuredDays ?? 30;
  const days =
    Number.isFinite(requestedDays) && requestedDays > 0
      ? Math.min(31, Math.max(1, Math.trunc(requestedDays)))
      : 30;
  const insuranceCeiling = laws.dailyMinimumWage * laws.insuranceCeilingMultiplier * days;
  const insuranceBase = Math.min(
    insuranceCeiling,
    Math.max(0, params.gross - Math.max(0, params.insuranceExempt ?? 0)),
  );
  const insurance = insuranceBase * laws.insuranceRate;
  // Art137/circular200/1400/94; full7% practice is acknowledged in the tax authority
  // response reproduced in ruling2763 (dotic15135), citing5040/1400/9985.
  const taxableIncome = Math.max(0, params.gross - Math.max(0, params.taxExempt ?? 0) - insurance);
  return { insuranceBase, insurance, taxableIncome, tax: calculateMonthlySalaryTax(taxableIncome) };
}
