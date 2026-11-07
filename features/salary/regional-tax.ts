import { calculateCumulativePayrollTax, type CumulativeTaxInput } from './cumulative-tax';

export type RegionalTaxConfirmation = {
  /** Exact employment-order location is on the official list applicable to this period. */
  currentOfficialListConfirmed: boolean;
  /** Same location in order + proven actual work there, NOT mission. */
  employmentConfirmed: boolean;
  /** Every ordinary rial and all earlier lists represented by previousTax are covered. */
  entirePeriodConfirmed: boolean;
  /** No family/disability/other personal or combined relief in these bases. */
  noOtherReliefConfirmed: boolean;
};

/** Article92: only externally verified whole-period ordinary employee income, no mixed relief. */
export function calculateRegionalPayrollTax(
  input: CumulativeTaxInput,
  confirmation: RegionalTaxConfirmation,
) {
  if (
    confirmation.currentOfficialListConfirmed !== true ||
    confirmation.employmentConfirmed !== true ||
    confirmation.entirePeriodConfirmed !== true ||
    confirmation.noOtherReliefConfirmed !== true
  ) {
    throw new Error(
      'تأیید فهرست رسمی، حکم و اشتغال واقعی و پوشش تمام دوره برای محاسبهٔ منطقه‌ای لازم است.',
    );
  }
  if (input.special !== 0 || input.research !== 0) {
    throw new Error(
      'بخشودگی منطقه‌ای این ابزار فقط برای درآمد عادی A است؛ درآمد ترکیبی B یا D پشتیبانی نمی‌شود.',
    );
  }
  const result = calculateCumulativePayrollTax(input);
  const taxBeforeRelief = result.cumulativeTax;
  const regionalRelief = taxBeforeRelief * 0.5;
  const cumulativeTax = taxBeforeRelief - regionalRelief;
  const currentTax = cumulativeTax - input.previousTax;
  return {
    ...result,
    taxBeforeRelief,
    regionalRelief,
    cumulativeTax,
    currentTax,
    payable: Math.max(0, currentTax),
    credit: Math.max(0, -currentTax),
  };
}
