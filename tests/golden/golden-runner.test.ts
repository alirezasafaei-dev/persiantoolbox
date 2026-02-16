import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { calculateLoan } from '@/features/loan/loan.logic';
import { calculateInterest } from '@/features/interest/interest.logic';

type LoanVector = {
  name: string;
  input: Parameters<typeof calculateLoan>[0];
  expected: {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  };
};

type InterestVector = {
  name: string;
  input: Parameters<typeof calculateInterest>[0];
  expected: {
    interest: number;
    finalAmount: number;
  };
};

function readJson<T>(path: string): T {
  const raw = readFileSync(resolve(process.cwd(), path), 'utf8');
  return JSON.parse(raw) as T;
}

describe('golden vectors', () => {
  it('keeps loan outputs stable against approved vectors', () => {
    const vectors = readJson<LoanVector[]>('tests/golden/vectors/loan.json');

    for (const vector of vectors) {
      const actual = calculateLoan(vector.input);
      expect(actual.monthlyPayment, vector.name).toBeCloseTo(vector.expected.monthlyPayment, 6);
      expect(actual.totalPayment, vector.name).toBeCloseTo(vector.expected.totalPayment, 6);
      expect(actual.totalInterest, vector.name).toBeCloseTo(vector.expected.totalInterest, 6);
    }
  });

  it('keeps interest outputs stable against approved vectors', () => {
    const vectors = readJson<InterestVector[]>('tests/golden/vectors/interest.json');

    for (const vector of vectors) {
      const actual = calculateInterest(vector.input);
      expect(actual.interest, vector.name).toBeCloseTo(vector.expected.interest, 6);
      expect(actual.finalAmount, vector.name).toBeCloseTo(vector.expected.finalAmount, 6);
    }
  });
});
