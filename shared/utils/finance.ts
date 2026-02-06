export type TaxCalculation = {
  baseAmount: number;
  ratePercent: number;
  taxAmount: number;
  totalWithTax: number;
};

export function calculateTax(amount: number, ratePercent: number): TaxCalculation {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeRate = Number.isFinite(ratePercent) ? ratePercent : 0;
  const taxAmount = (safeAmount * safeRate) / 100;
  return {
    baseAmount: safeAmount,
    ratePercent: safeRate,
    taxAmount,
    totalWithTax: safeAmount + taxAmount,
  };
}

export type CompoundInterestInput = {
  principal: number;
  annualRatePercent: number;
  years: number;
  timesPerYear?: number;
};

export type CompoundInterestResult = {
  principal: number;
  total: number;
  interest: number;
  annualRatePercent: number;
  years: number;
  timesPerYear: number;
};

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const principal = Number.isFinite(input.principal) ? input.principal : 0;
  const annualRatePercent = Number.isFinite(input.annualRatePercent) ? input.annualRatePercent : 0;
  const years = Number.isFinite(input.years) ? input.years : 0;
  const timesPerYear = input.timesPerYear && input.timesPerYear > 0 ? input.timesPerYear : 1;
  const rate = annualRatePercent / 100;
  const total = principal * Math.pow(1 + rate / timesPerYear, timesPerYear * years);
  const interest = total - principal;
  return {
    principal,
    total,
    interest,
    annualRatePercent,
    years,
    timesPerYear,
  };
}

export function convertRialToToman(amountRial: number): number {
  const value = Number.isFinite(amountRial) ? amountRial : 0;
  return value / 10;
}

export function convertTomanToRial(amountToman: number): number {
  const value = Number.isFinite(amountToman) ? amountToman : 0;
  return value * 10;
}
