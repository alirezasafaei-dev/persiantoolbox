import type { SalaryLaws } from './salary.types';
import salaryLawsData from '@/data/salary-laws/v1.json';

export type SalaryRegion = 'default';

type LawsByYear = Record<number, SalaryLaws>;

type LawsByRegion = Record<SalaryRegion, LawsByYear>;

const DEFAULT_REGION: SalaryRegion = 'default';

const lawsByYear: LawsByYear = Object.fromEntries(
  Object.entries(salaryLawsData.years).map(([year, laws]) => [Number(year), laws as SalaryLaws]),
) as LawsByYear;

const LAWS: LawsByRegion = {
  default: lawsByYear,
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
