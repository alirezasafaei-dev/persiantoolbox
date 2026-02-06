import { describe, it, expect } from 'vitest';
import {
  addDays,
  compareDateParts,
  createUtcDate,
  daysInGregorianMonth,
  daysInGregorianYear,
  dayOfYear,
  getLocalDateParts,
  getUtcDateParts,
  getWeekdayName,
  isLeapGregorian,
  normalizeToGregorian,
  differenceInDays,
  differenceInYmd,
  convertDate,
  gregorianToJalali,
  gregorianToIslamic,
  isLeapJalali,
  isLeapIslamic,
  isValidIslamicDate,
  isValidJalaliDate,
  isValidGregorianDate,
  islamicToGregorian,
  jalaliToGregorian,
} from './date-tools.logic';

describe('date tools logic', () => {
  it('converts Gregorian to Jalali correctly for Nowruz 1403', () => {
    const jalali = gregorianToJalali(2024, 3, 20);
    expect(jalali).toEqual({ year: 1403, month: 1, day: 1 });
  });

  it('converts Jalali to Gregorian correctly for 1402/07/01', () => {
    const gregorian = jalaliToGregorian(1402, 7, 1);
    expect(gregorian).toEqual({ year: 2023, month: 9, day: 23 });
  });

  it('validates leap years in Jalali calendar', () => {
    expect(isLeapJalali(1399)).toBe(true);
    expect(isLeapJalali(1400)).toBe(false);
  });

  it('validates date ranges', () => {
    expect(isValidGregorianDate({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(isValidGregorianDate({ year: 2023, month: 2, day: 29 })).toBe(false);
    expect(isValidGregorianDate({ year: 0, month: 1, day: 1 })).toBe(false);
    expect(isValidGregorianDate({ year: 2024, month: 13, day: 1 })).toBe(false);
    expect(isValidJalaliDate({ year: 1401, month: 12, day: 30 })).toBe(false);
    expect(isValidJalaliDate({ year: 0, month: 1, day: 1 })).toBe(false);
    expect(isValidJalaliDate({ year: 1401, month: 13, day: 1 })).toBe(false);
    expect(isValidIslamicDate({ year: 1443, month: 12, day: 30 })).toBe(false);
    expect(isValidIslamicDate({ year: 1442, month: 12, day: 30 })).toBe(true);
    expect(isValidIslamicDate({ year: 0, month: 1, day: 1 })).toBe(false);
    expect(isValidIslamicDate({ year: 1444, month: 13, day: 1 })).toBe(false);
  });

  it('calculates difference and day shifts accurately', () => {
    const start = { year: 2024, month: 3, day: 20 };
    const end = { year: 2024, month: 3, day: 21 };
    expect(differenceInDays(start, end)).toBe(1);

    const shifted = addDays(start, 10);
    expect(shifted).toEqual({ year: 2024, month: 3, day: 30 });

    const ymd = differenceInYmd(start, { year: 2025, month: 4, day: 25 });
    expect(ymd).toEqual({ years: 1, months: 1, days: 5 });
  });

  it('returns day of year and weekday name correctly', () => {
    expect(dayOfYear({ year: 2024, month: 1, day: 1 })).toBe(1);
    expect(dayOfYear({ year: 2024, month: 12, day: 31 })).toBe(366);
    expect(getWeekdayName({ year: 2024, month: 3, day: 20 })).toBe('چهارشنبه');
    expect(getWeekdayName({ year: 2024, month: 3, day: 23 })).toBe('شنبه');
    expect(getWeekdayName({ year: 2024, month: 3, day: 19 })).toBe('سه‌شنبه');
    expect(getWeekdayName({ year: 2024, month: 3, day: 21 })).toBe('پنجشنبه');
    expect(getWeekdayName({ year: 2024, month: 3, day: 22 })).toBe('جمعه');
    expect(getWeekdayName({ year: 2024, month: 3, day: 24 })).toBe('یکشنبه');
    expect(getWeekdayName({ year: 2024, month: 3, day: 25 })).toBe('دوشنبه');
  });

  it('normalizes dates based on calendar type', () => {
    const greg = normalizeToGregorian({ year: 2024, month: 3, day: 20 }, 'gregorian');
    expect(greg).toEqual({ year: 2024, month: 3, day: 20 });

    const jalali = normalizeToGregorian({ year: 1403, month: 1, day: 1 }, 'jalali');
    expect(jalali).toEqual({ year: 2024, month: 3, day: 20 });

    const islamic = normalizeToGregorian({ year: 1445, month: 9, day: 10 }, 'islamic');
    expect(islamic).not.toBeNull();

    const invalid = normalizeToGregorian({ year: 1403, month: 13, day: 1 }, 'jalali');
    expect(invalid).toBeNull();

    const invalidGreg = normalizeToGregorian({ year: 2024, month: 2, day: 30 }, 'gregorian');
    expect(invalidGreg).toBeNull();
  });

  it('handles leap and month utilities', () => {
    expect(isLeapGregorian(2024)).toBe(true);
    expect(isLeapGregorian(2100)).toBe(false);
    expect(daysInGregorianMonth(2024, 2)).toBe(29);
    expect(daysInGregorianMonth(2024, 13)).toBe(0);
    expect(daysInGregorianYear(2023)).toBe(365);
  });

  it('compares date parts and extracts utc/local parts', () => {
    expect(
      compareDateParts({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 1, day: 2 }),
    ).toBe(-1);
    expect(
      compareDateParts({ year: 2024, month: 2, day: 1 }, { year: 2024, month: 1, day: 2 }),
    ).toBe(1);
    expect(
      compareDateParts({ year: 2024, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 }),
    ).toBe(0);

    const date = createUtcDate({ year: 2024, month: 3, day: 20 });
    expect(getUtcDateParts(date)).toEqual({ year: 2024, month: 3, day: 20 });
    expect(getLocalDateParts(date).year).toBe(2024);
  });

  it('handles month/day borrow in differenceInYmd', () => {
    const result = differenceInYmd(
      { year: 2024, month: 3, day: 31 },
      { year: 2024, month: 4, day: 1 },
    );
    expect(result).toEqual({ years: 0, months: 0, days: 1 });
  });

  it('handles negative month differences in differenceInYmd', () => {
    const result = differenceInYmd(
      { year: 2024, month: 11, day: 20 },
      { year: 2025, month: 1, day: 10 },
    );
    expect(result).toEqual({ years: 0, months: 1, days: 21 });
  });

  it('throws for jalali out of range', () => {
    expect(() => isLeapJalali(4000)).toThrow('سال شمسی خارج از بازه معتبر است.');
  });

  it('converts dates with ToolResult', () => {
    const g = convertDate({
      from: 'jalali',
      to: 'gregorian',
      date: { year: 1403, month: 1, day: 1 },
    });
    expect(g.ok).toBe(true);
    if (g.ok) {
      expect(g.data).toEqual({ year: 2024, month: 3, day: 20 });
    }

    const invalid = convertDate({
      from: 'gregorian',
      to: 'jalali',
      date: { year: 2024, month: 2, day: 30 },
    });
    expect(invalid.ok).toBe(false);
  });

  it('handles islamic calendar conversions', () => {
    expect(isLeapIslamic(1442)).toBe(true);
    expect(isLeapIslamic(1443)).toBe(false);

    const greg = { year: 2024, month: 3, day: 20 };
    const islamic = gregorianToIslamic(greg.year, greg.month, greg.day);
    const back = islamicToGregorian(islamic.year, islamic.month, islamic.day);
    expect(back).toEqual(greg);
  });
});
