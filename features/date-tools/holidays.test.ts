import { describe, it, expect } from 'vitest';
import {
  getIslamicHoliday,
  getJalaliHoliday,
  listIslamicHolidays,
  listJalaliHolidays,
} from './holidays';

describe('jalali holidays', () => {
  it('returns fixed holidays for a date', () => {
    const holiday = getJalaliHoliday({ year: 1403, month: 1, day: 1 });
    expect(holiday?.title).toBe('نوروز');
  });

  it('lists holidays for a year', () => {
    const list = listJalaliHolidays(1403);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]?.year).toBe(1403);
  });
});

describe('islamic holidays', () => {
  it('returns fixed holidays for a date', () => {
    const holiday = getIslamicHoliday({ year: 1447, month: 1, day: 10 });
    expect(holiday?.title).toBe('عاشورای حسینی');
  });

  it('lists holidays for a year', () => {
    const list = listIslamicHolidays(1447);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]?.year).toBe(1447);
  });
});
