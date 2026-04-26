export type SalaryInput = {
  baseSalary: number;
  workingDays: number;
  workExperienceYears: number;
  overtimeHours: number;
  nightOvertimeHours: number;
  holidayOvertimeHours: number;
  missionDays: number;
  isMarried: boolean;
  numberOfChildren: number;
  hasWorkerCoupon: boolean;
  hasTransportation: boolean;
  otherBenefits: number;
  otherDeductions: number;
  isDevelopmentZone: boolean;
};

export type SalarySummary = {
  insurance: number;
  tax: number;
  totalDeductions: number;
};

export type SalaryOutput = {
  grossSalary: number;
  netSalary: number;
  summary: SalarySummary;
};

export type MinimumWageOutput = {
  baseSalary: number;
  housingAllowance: number;
  foodAllowance: number;
  marriageAllowance: number;
  childAllowance: number;
  seniorityAllowance: number;
  totalGross: number;
  insuranceAmount: number;
  taxAmount: number;
  netSalary: number;
};

export type SalaryTaxBracket = {
  upTo: number | null;
  rate: number;
};

export type SalaryLaws = {
  year: number;
  minimumWage: number;
  taxExemption: number;
  insuranceRate: number;
  housingAllowance: number;
  foodAllowance: number;
  transportationAllowance: number;
  childAllowance: number;
  marriageAllowance: number;
  seniorityAllowance: number;
  taxBrackets: SalaryTaxBracket[];
};
