import type { SalaryLaws } from './salary.types';

export type SalaryRegion = 'default';

type LawsByYear = Record<number, SalaryLaws>;

type LawsByRegion = Record<SalaryRegion, LawsByYear>;

const DEFAULT_REGION: SalaryRegion = 'default';

const LAWS: LawsByRegion = {
  default: {
    2026: {
      year: 2026,
      minimumWage: 10000000,
      taxExemption: 12000000,
      insuranceRate: 0.07,
      taxRate: 0.1,
      housingAllowance: 3000000,
      foodAllowance: 2000000,
      transportationAllowance: 1500000,
      childAllowance: 500000,
      experienceRatePerYear: 0.01,
    },
  },
};

const resolveYear = (region: SalaryRegion, year?: number) => {
  const availableYears = Object.keys(LAWS[region])
    .map(Number)
    .sort((a, b) => a - b);
  if (availableYears.length === 0) {
    throw new Error('قوانین حقوقی در دسترس نیستند.');
  }
  if (year && LAWS[region][year]) {
    return year;
  }
  const latest = availableYears.at(-1);
  if (!latest) {
    throw new Error('قوانین حقوقی در دسترس نیستند.');
  }
  return latest;
};

export const getAvailableSalaryYears = (region: SalaryRegion = DEFAULT_REGION) =>
  Object.keys(LAWS[region])
    .map(Number)
    .sort((a, b) => a - b);

export function getSalaryLaws(options: { year?: number; region?: SalaryRegion } = {}): SalaryLaws {
  const region = options.region ?? DEFAULT_REGION;
  const year = resolveYear(region, options.year ?? new Date().getFullYear());
  const laws = LAWS[region][year];
  if (!laws) {
    throw new Error('قوانین حقوقی در دسترس نیستند.');
  }
  return laws;
}
