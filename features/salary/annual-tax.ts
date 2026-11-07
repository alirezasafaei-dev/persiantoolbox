import data from '@/data/salary-laws/v1.json';

/** Full-year ordinary-rate estimate. The input is before the article84 exemption. */
export function calculateAnnualTaxBalance(taxableAnnualIncome: number, withheld: number) {
  if (![taxableAnnualIncome, withheld].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error('مبالغ سالانه باید عدد معتبر و نامنفی باشند.');
  }
  const limits = data.review.deductions.taxBrackets.annualRialThresholds;
  const brackets = data.years['2026'].taxBrackets;
  let previous = 0;
  let annualTax = 0;
  for (const [index, bracket] of brackets.entries()) {
    const limit = limits[index] === undefined ? Infinity : limits[index] / 10;
    annualTax += Math.max(0, Math.min(taxableAnnualIncome, limit) - previous) * bracket.rate;
    previous = limit;
  }
  return {
    annualTax,
    remaining: Math.max(0, annualTax - withheld),
    overpaid: Math.max(0, withheld - annualTax),
  };
}
