import type { SalaryInput, SalaryOutput, MinimumWageOutput } from './salary.types';
import { getSalaryLaws } from './salary.laws';
export { getSalaryLaws, type SalaryRegion } from './salary.laws';

function normalizeWorkingDays(days: number): number {
  if (!Number.isFinite(days) || days <= 0) {
    return 30;
  }
  return Math.min(31, Math.max(1, days));
}

function hourlyRate(baseSalary: number): number {
  return baseSalary / 220;
}

function calcOvertime(baseSalary: number, hours: number, multiplier: number): number {
  if (!Number.isFinite(hours) || hours <= 0) {
    return 0;
  }
  return hourlyRate(baseSalary) * hours * multiplier;
}

function hasSeniorityEligibility(workExperienceYears: number): boolean {
  return Number.isFinite(workExperienceYears) && workExperienceYears >= 1;
}

function calculateProgressiveTax(taxableIncome: number): number {
  const laws = getSalaryLaws();
  if (!Number.isFinite(taxableIncome) || taxableIncome <= 0) {
    return 0;
  }

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of laws.taxBrackets) {
    const upperLimit = bracket.upTo ?? Number.POSITIVE_INFINITY;
    if (taxableIncome <= previousLimit) {
      break;
    }
    const taxableSlice = Math.min(taxableIncome, upperLimit) - previousLimit;
    if (taxableSlice > 0) {
      tax += taxableSlice * bracket.rate;
    }
    previousLimit = upperLimit;
  }

  return tax;
}

export function calculateSalary(input: SalaryInput): SalaryOutput {
  const laws = getSalaryLaws();
  const workingDays = normalizeWorkingDays(input.workingDays);
  const baseSalary = input.baseSalary * (workingDays / 30);

  const baseAllowance = laws.housingAllowance + laws.foodAllowance;
  const transportAllowance = input.hasTransportation ? laws.transportationAllowance : 0;
  const couponAllowance = input.hasWorkerCoupon ? laws.foodAllowance : 0;
  const childAllowance = Math.max(0, input.numberOfChildren) * laws.childAllowance;
  const marriageAllowance = input.isMarried ? laws.marriageAllowance : 0;
  const seniorityAllowance = hasSeniorityEligibility(input.workExperienceYears)
    ? laws.seniorityAllowance
    : 0;

  const overtime = calcOvertime(input.baseSalary, input.overtimeHours, 1.4);
  const nightOvertime = calcOvertime(input.baseSalary, input.nightOvertimeHours, 1.35);
  const holidayOvertime = calcOvertime(input.baseSalary, input.holidayOvertimeHours, 2.0);

  const missionAllowance = Math.max(0, input.missionDays) * (input.baseSalary / 30) * 0.1;

  const grossSalary = Math.max(
    0,
    baseSalary +
      baseAllowance +
      transportAllowance +
      couponAllowance +
      childAllowance +
      marriageAllowance +
      seniorityAllowance +
      overtime +
      nightOvertime +
      holidayOvertime +
      missionAllowance +
      Math.max(0, input.otherBenefits),
  );

  const insurance = grossSalary * laws.insuranceRate;
  const taxableIncome = Math.max(0, grossSalary - insurance);
  const tax = calculateProgressiveTax(taxableIncome);
  const totalDeductions = insurance + tax + Math.max(0, input.otherDeductions);
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    grossSalary,
    netSalary,
    summary: {
      insurance,
      tax,
      totalDeductions,
    },
  };
}

export function calculateGrossFromNet(
  targetNet: number,
  input: Omit<SalaryInput, 'baseSalary'>,
): SalaryOutput {
  if (!Number.isFinite(targetNet) || targetNet <= 0) {
    throw new Error('حقوق خالص نامعتبر است.');
  }

  let low = 0;
  let high = Math.max(10_000_000, targetNet * 5);

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const result = calculateSalary({ ...input, baseSalary: mid });

    if (result.netSalary > targetNet) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return calculateSalary({ ...input, baseSalary: (low + high) / 2 });
}

export function calculateMinimumWage(params: {
  workExperienceYears: number;
  isMarried: boolean;
  numberOfChildren: number;
  isDevelopmentZone: boolean;
  otherDeductions: number;
}): MinimumWageOutput {
  const laws = getSalaryLaws();
  const baseSalary = laws.minimumWage;
  const housingAllowance = laws.housingAllowance;
  const foodAllowance = laws.foodAllowance;
  const marriageAllowance = params.isMarried ? laws.marriageAllowance : 0;
  const childAllowance = Math.max(0, params.numberOfChildren) * laws.childAllowance;
  const seniorityAllowance = hasSeniorityEligibility(params.workExperienceYears)
    ? laws.seniorityAllowance
    : 0;
  const zoneBonus = params.isDevelopmentZone ? baseSalary * 0.05 : 0;

  const totalGross =
    baseSalary +
    housingAllowance +
    foodAllowance +
    marriageAllowance +
    childAllowance +
    seniorityAllowance +
    zoneBonus;
  const insuranceAmount = totalGross * laws.insuranceRate;
  const taxableIncome = Math.max(0, totalGross - insuranceAmount);
  const taxAmount = calculateProgressiveTax(taxableIncome);
  const netSalary = Math.max(
    0,
    totalGross - insuranceAmount - taxAmount - Math.max(0, params.otherDeductions),
  );

  return {
    baseSalary,
    housingAllowance,
    foodAllowance,
    marriageAllowance,
    childAllowance,
    seniorityAllowance,
    totalGross,
    insuranceAmount,
    taxAmount,
    netSalary,
  };
}
