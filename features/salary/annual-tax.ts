import { calculateCumulativePayrollTax } from './cumulative-tax';

/** Full-year ordinary-rate estimate. The input is before the article84 exemption. */
export function calculateAnnualTaxBalance(taxableAnnualIncome: number, withheld: number) {
  if (![taxableAnnualIncome, withheld].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error('مبالغ سالانه باید عدد معتبر و نامنفی باشند.');
  }
  const { cumulativeTax: annualTax } = calculateCumulativePayrollTax({
    month: 12,
    ordinary: taxableAnnualIncome,
    special: 0,
    research: 0,
    previousTax: withheld,
  });
  return {
    annualTax,
    remaining: Math.max(0, annualTax - withheld),
    overpaid: Math.max(0, withheld - annualTax),
  };
}
