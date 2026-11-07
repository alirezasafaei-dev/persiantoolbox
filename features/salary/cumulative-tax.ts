import data from '@/data/salary-laws/v1.json';

export type CumulativeTaxInput = {
  /** Payroll/payment list month, NOT transmission date, employment months or list count. */
  month: number;
  /** YTD net A/B/D bases after item-level exemptions/deductions, before article84. */
  ordinary: number;
  special: number;
  research: number;
  /** Sum of tax COMPUTED for previous lists, not merely cash paid. */
  previousTax: number;
};

/** INTA1405 official six-step guide, /action/do/download/227. All amounts in toman. */
export function calculateCumulativePayrollTax(input: CumulativeTaxInput) {
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    throw new Error('ماه فهرست باید عدد صحیح بین ۱ تا ۱۲ باشد.');
  }
  const amounts = [input.ordinary, input.special, input.research, input.previousTax];
  const maximum = Number.MAX_SAFE_INTEGER / 10;
  if (
    !amounts.every((value) => Number.isFinite(value) && value >= 0 && value <= maximum) ||
    input.ordinary + input.special + input.research > maximum
  ) {
    throw new Error('مبالغ باید عدد معتبر و نامنفی در محدودهٔ محاسبه باشند.');
  }
  const limits = data.review.deductions.taxBrackets.annualRialThresholds;
  const brackets = data.years['2026'].taxBrackets;
  const annualExemption = limits[0];
  if (annualExemption === undefined) {
    throw new Error('جدول معافیت مالیاتی در دسترس نیست.');
  }
  const exemption = (annualExemption / 10 / 12) * input.month;
  const combined = input.ordinary + input.special;
  const ordinaryExemption = combined > 0 ? exemption * (input.ordinary / combined) : 0;
  const specialExemption = combined > 0 ? exemption * (input.special / combined) : 0;
  // Step3: shift ALL cumulative ordinary thresholds down by B's exemption share;
  // subtracting that share from A's income would incorrectly lower its taxation.
  let lower = 0;
  let ordinaryTax = 0;
  for (const [index, bracket] of brackets.entries()) {
    const upper =
      limits[index] === undefined
        ? Infinity
        : Math.max(0, (limits[index] / 10 / 12) * input.month - specialExemption);
    ordinaryTax += Math.max(0, Math.min(input.ordinary, upper) - lower) * bracket.rate;
    lower = upper;
  }
  const specialTax =
    Math.max(0, input.special - specialExemption) *
    data.review.deductions.cumulativeTax.specialRate;
  const researchTax = input.research * data.review.deductions.cumulativeTax.researchRate;
  const cumulativeTax = ordinaryTax + specialTax + researchTax;
  const currentTax = cumulativeTax - input.previousTax;
  return {
    ordinaryExemption,
    specialExemption,
    ordinaryTax,
    specialTax,
    researchTax,
    cumulativeTax,
    currentTax,
    payable: Math.max(0, currentTax),
    credit: Math.max(0, -currentTax),
  };
}
