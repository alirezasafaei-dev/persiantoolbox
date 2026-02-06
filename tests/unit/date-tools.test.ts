import { describe, it, expect } from 'vitest';
import {
  addDays,
  compareDateParts,
  convertDate,
  createUtcDate,
  dayOfYear,
  daysInGregorianMonth,
  daysInGregorianYear,
  daysInIslamicMonth,
  differenceInDays,
  differenceInYmd,
  getLocalDateParts,
  getUtcDateParts,
  getWeekdayName,
  gregorianToIslamic,
  gregorianToJalali,
  isLeapGregorian,
  isLeapIslamic,
  isLeapJalali,
  isValidGregorianDate,
  isValidIslamicDate,
  isValidJalaliDate,
  islamicToGregorian,
  jalaliToGregorian,
  normalizeToGregorian,
} from '@/features/date-tools/date-tools.logic';

describe('date tools logic', () => {
  it('validates Gregorian leap years and month lengths', () => {
    expect(isLeapGregorian(2000)).toBe(true);
    expect(isLeapGregorian(1900)).toBe(false);
    expect(isLeapGregorian(2024)).toBe(true);
    expect(isLeapGregorian(2023)).toBe(false);
    expect(daysInGregorianMonth(2024, 2)).toBe(29);
    expect(daysInGregorianMonth(2023, 2)).toBe(28);
    expect(daysInGregorianMonth(2023, 13)).toBe(0);
  });

  it('validates Gregorian dates', () => {
    expect(isValidGregorianDate({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(isValidGregorianDate({ year: 2023, month: 2, day: 29 })).toBe(false);
    expect(isValidGregorianDate({ year: 0, month: 1, day: 1 })).toBe(false);
  });

  it('validates Jalali dates and leap years', () => {
    expect(isLeapJalali(1399)).toBe(true);
    expect(isLeapJalali(1400)).toBe(false);
    expect(isValidJalaliDate({ year: 1399, month: 12, day: 30 })).toBe(true);
    expect(isValidJalaliDate({ year: 1400, month: 12, day: 30 })).toBe(false);
    expect(isValidJalaliDate({ year: 1400, month: 13, day: 1 })).toBe(false);
  });

  it('validates Islamic dates and leap years', () => {
    expect(isLeapIslamic(2)).toBe(true);
    expect(isLeapIslamic(3)).toBe(false);
    expect(daysInIslamicMonth(2, 12)).toBe(30);
    expect(daysInIslamicMonth(3, 12)).toBe(29);
    expect(isValidIslamicDate({ year: 1, month: 1, day: 30 })).toBe(true);
    expect(isValidIslamicDate({ year: 1, month: 13, day: 1 })).toBe(false);
  });

  it('converts between Jalali and Gregorian calendars', () => {
    expect(gregorianToJalali(2024, 3, 20)).toEqual({ year: 1403, month: 1, day: 1 });
    expect(jalaliToGregorian(1403, 1, 1)).toEqual({ year: 2024, month: 3, day: 20 });
  });

  it('round-trips between Gregorian and Islamic calendars', () => {
    const islamic = gregorianToIslamic(2024, 3, 20);
    const back = islamicToGregorian(islamic.year, islamic.month, islamic.day);
    expect(back).toEqual({ year: 2024, month: 3, day: 20 });
  });

  it('normalizes dates to Gregorian or returns null for invalid inputs', () => {
    expect(normalizeToGregorian({ year: 2024, month: 3, day: 20 }, 'gregorian')).toEqual({
      year: 2024,
      month: 3,
      day: 20,
    });
    expect(normalizeToGregorian({ year: 1400, month: 12, day: 30 }, 'jalali')).toBeNull();
    expect(normalizeToGregorian({ year: 1445, month: 12, day: 30 }, 'islamic')).not.toBeNull();
  });

  it('compares dates correctly', () => {
    expect(
      compareDateParts({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 }),
    ).toBe(0);
    expect(
      compareDateParts({ year: 2023, month: 12, day: 31 }, { year: 2024, month: 1, day: 1 }),
    ).toBe(-1);
    expect(
      compareDateParts({ year: 2024, month: 2, day: 1 }, { year: 2024, month: 1, day: 31 }),
    ).toBe(1);
  });

  it('calculates date differences and additions', () => {
    expect(
      differenceInDays({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 1, day: 10 }),
    ).toBe(9);
    expect(
      differenceInYmd({ year: 2024, month: 1, day: 31 }, { year: 2024, month: 2, day: 1 }),
    ).toEqual({
      years: 0,
      months: 0,
      days: 1,
    });
    expect(addDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(addDays({ year: 2024, month: 2, day: 28 }, 2)).toEqual({ year: 2024, month: 3, day: 1 });
  });

  it('computes day of year and weekday names', () => {
    expect(dayOfYear({ year: 2024, month: 3, day: 1 })).toBe(61);
    expect(daysInGregorianYear(2024)).toBe(366);
    expect(daysInGregorianYear(2023)).toBe(365);
    expect(getWeekdayName({ year: 2024, month: 3, day: 20 })).toBe('چهارشنبه');
  });

  it('handles UTC and local date parts', () => {
    const utcDate = createUtcDate({ year: 2024, month: 3, day: 20 });
    expect(getUtcDateParts(utcDate)).toEqual({ year: 2024, month: 3, day: 20 });

    const localDate = new Date(2024, 0, 5);
    expect(getLocalDateParts(localDate)).toEqual({ year: 2024, month: 1, day: 5 });
  });

  it('converts dates using convertDate helper', () => {
    const result = convertDate({
      from: 'jalali',
      to: 'gregorian',
      date: { year: 1403, month: 1, day: 1 },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ year: 2024, month: 3, day: 20 });
    }

    const invalid = convertDate({
      from: 'gregorian',
      to: 'jalali',
      date: { year: 2024, month: 2, day: 30 },
    });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.error.code).toBe('INVALID_GREGORIAN_DATE');
    }
  });
});
