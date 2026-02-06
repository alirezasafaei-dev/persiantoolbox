import { describe, it, expect } from 'vitest';
import {
  isValidCardNumber,
  isValidIranianMobile,
  isValidIranianPlate,
  isValidIranianPostalCode,
  isValidIranianSheba,
  isValidNationalId,
  normalizeIranianMobile,
} from '@/shared/utils/validation';

describe('validation utils', () => {
  it('validates national id', () => {
    expect(isValidNationalId('0010350829')).toBe(true);
    expect(isValidNationalId('1000000011')).toBe(true);
    expect(isValidNationalId('1000000001')).toBe(true);
    expect(isValidNationalId('1111111111')).toBe(false);
    expect(isValidNationalId('123')).toBe(false);
  });

  it('normalizes and validates iranian mobile', () => {
    expect(normalizeIranianMobile('09123456789')).toBe('09123456789');
    expect(normalizeIranianMobile('+989123456789')).toBe('09123456789');
    expect(normalizeIranianMobile('00989123456789')).toBe('09123456789');
    expect(isValidIranianMobile('9123456789')).toBe(true);
    expect(isValidIranianMobile('08123456789')).toBe(false);
  });

  it('validates card number (luhn)', () => {
    expect(isValidCardNumber('6274129005473742')).toBe(true);
    expect(isValidCardNumber('6037991894123457')).toBe(false);
    expect(isValidCardNumber('123')).toBe(false);
  });

  it('validates iranian sheba', () => {
    expect(isValidIranianSheba('IR062960000000100324200001')).toBe(true);
    expect(isValidIranianSheba('IR000000000000000000000000')).toBe(false);
    expect(isValidIranianSheba('GB82WEST1234')).toBe(false);
  });

  it('validates postal code', () => {
    expect(isValidIranianPostalCode('1234567890')).toBe(true);
    expect(isValidIranianPostalCode('0000000000')).toBe(false);
    expect(isValidIranianPostalCode('12345')).toBe(false);
  });

  it('validates plate numbers', () => {
    expect(isValidIranianPlate('12ب34567')).toBe(true);
    expect(isValidIranianPlate('12X34567')).toBe(false);
    expect(isValidIranianPlate('12345')).toBe(false);
  });
});
