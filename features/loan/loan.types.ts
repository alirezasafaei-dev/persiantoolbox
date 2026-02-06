export type CalculationType = 'installment' | 'rate' | 'principal' | 'months';
export type LoanType = 'regular' | 'qarzolhasaneh' | 'stepped';

export type StepDetail = {
  step: number;
  months: number;
  rate: number;
  monthlyPayment: number;
};

export type LoanInput = {
  principal: number;
  annualInterestRatePercent: number;
  months: number;
  loanType: LoanType;
  calculationType: CalculationType;
  monthlyPayment?: number;
  stepMonths?: number;
  stepRateIncrease?: number;
};

export type LoanResult = {
  principal: number;
  months: number;
  annualInterestRatePercent: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate?: number;
  stepDetails?: StepDetail[];
};
