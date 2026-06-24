import { describe, it, expect } from 'vitest';

function calculateVat(baseAmount: number, rate: number, mode: 'exclusive' | 'inclusive') {
  if (baseAmount <= 0 || rate <= 0) {
    return null;
  }

  if (mode === 'exclusive') {
    const vatAmount = baseAmount * (rate / 100);
    return { baseAmount, vatAmount, totalAmount: baseAmount + vatAmount, rate };
  }

  const totalAmount = baseAmount;
  const base = totalAmount / (1 + rate / 100);
  const vatAmount = totalAmount - base;
  return { baseAmount: base, vatAmount, totalAmount, rate };
}

function calculateCheckPenalty(
  principal: number,
  dueDateIndex: number,
  paymentDateIndex: number,
) {
  if (principal <= 0 || dueDateIndex <= 0 || paymentDateIndex <= 0) {
    return null;
  }
  const ratio = paymentDateIndex / dueDateIndex;
  const total = principal * ratio;
  const penalty = total - principal;
  return { principal, penalty, total, ratio };
}

function calculateMahr(mahrAmount: number, marriageIndex: number, currentIndex: number) {
  if (mahrAmount <= 0 || marriageIndex <= 0 || currentIndex <= 0) {
    return null;
  }
  const ratio = currentIndex / marriageIndex;
  const mahrToday = mahrAmount * ratio;
  const increase = mahrToday - mahrAmount;
  return { mahrAmount, mahrToday, ratio, increase };
}

function calculateProfit(costPrice: number, sellingPrice: number) {
  if (costPrice <= 0 || sellingPrice <= 0) {
    return null;
  }
  const profit = sellingPrice - costPrice;
  const grossMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markup = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  return { costPrice, sellingPrice, profit, grossMargin, markup };
}

function calculateHiring(
  baseSalary: number,
  foodAllowance: number,
  housingAllowance: number,
  yearsOfService: number,
) {
  if (baseSalary <= 0) {
    return null;
  }
  const insuranceEmployer = baseSalary * 0.23;
  const bonus = baseSalary / 12;
  const severance = (baseSalary / 12) * yearsOfService;
  const totalMonthly =
    baseSalary + insuranceEmployer + bonus + foodAllowance + housingAllowance;
  const totalAnnual = totalMonthly * 12;
  return { baseSalary, insuranceEmployer, bonus, severance, totalMonthly, totalAnnual };
}

describe('financial tools golden tests', () => {
  describe('VAT calculator', () => {
    it('adds VAT: 1,000,000 at 10%', () => {
      const result = calculateVat(1_000_000, 10, 'exclusive');
      expect(result).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.baseAmount).toBe(1_000_000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.vatAmount).toBe(100_000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.totalAmount).toBe(1_100_000);
    });

    it('reverse VAT: 1,100,000 at 10%', () => {
      const result = calculateVat(1_100_000, 10, 'inclusive');
      expect(result).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.baseAmount).toBeCloseTo(1_000_000, 0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.vatAmount).toBeCloseTo(100_000, 0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.totalAmount).toBe(1_100_000);
    });
  });

  describe('Check penalty calculator', () => {
    it('10,000,000 with CPI 100→200', () => {
      const result = calculateCheckPenalty(10_000_000, 100, 200);
      expect(result).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.ratio).toBe(2);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.total).toBe(20_000_000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.penalty).toBe(10_000_000);
    });
  });

  describe('Mahr calculator', () => {
    it('100 gold coins with CPI 100→150', () => {
      const result = calculateMahr(100, 100, 150);
      expect(result).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.ratio).toBe(1.5);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.mahrToday).toBe(150);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.increase).toBe(50);
    });
  });

  describe('Profit margin calculator', () => {
    it('cost 800,000, sell 1,000,000', () => {
      const result = calculateProfit(800_000, 1_000_000);
      expect(result).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.profit).toBe(200_000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.grossMargin).toBeCloseTo(20, 1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.markup).toBeCloseTo(25, 1);
    });
  });

  describe('Hiring cost calculator', () => {
    it('base salary 10,000,000 with 1 year service', () => {
      const result = calculateHiring(10_000_000, 0, 0, 1);
      expect(result).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.insuranceEmployer).toBe(2_300_000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.bonus).toBeCloseTo(833_333.33, 0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.severance).toBeCloseTo(833_333.33, 0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.totalMonthly).toBeCloseTo(13_133_333.33, 0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(result!.totalAnnual).toBeCloseTo(157_600_000, -3);
    });
  });
});
