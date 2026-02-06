import { daysInIslamicMonth, type DateParts } from './date-tools.logic';

export type HolidayType = 'official' | 'cultural';

export type JalaliHoliday = {
  month: number;
  day: number;
  title: string;
  type: HolidayType;
};

export type IslamicHoliday = {
  month: number;
  day: number;
  title: string;
  type: HolidayType;
};

export type HolidaySource = {
  title: string;
  note: string;
};

export const HOLIDAY_SOURCES: HolidaySource[] = [
  {
    title: 'تقویم رسمی کشور (مرکز تقویم مؤسسه ژئوفیزیک دانشگاه تهران)',
    note: 'مبنای تعطیلات قمری رسمی در ایران و مصوبات شورای فرهنگ عمومی',
  },
];

// In case official calendar announces a one-day shift for a given Hijri year.
// Example: { 1447: 1 } means add 1 day to all Islamic holiday dates in that year.
const ISLAMIC_YEAR_OFFSETS: Record<number, number> = {};

export const FIXED_JALALI_HOLIDAYS: JalaliHoliday[] = [
  { month: 1, day: 1, title: 'نوروز', type: 'official' },
  { month: 1, day: 2, title: 'نوروز', type: 'official' },
  { month: 1, day: 3, title: 'نوروز', type: 'official' },
  { month: 1, day: 4, title: 'نوروز', type: 'official' },
  { month: 1, day: 12, title: 'روز جمهوری اسلامی', type: 'official' },
  { month: 1, day: 13, title: 'روز طبیعت', type: 'official' },
  { month: 3, day: 14, title: 'رحلت امام خمینی', type: 'official' },
  { month: 3, day: 15, title: 'قیام ۱۵ خرداد', type: 'official' },
  { month: 11, day: 22, title: 'پیروزی انقلاب اسلامی', type: 'official' },
  { month: 12, day: 29, title: 'ملی شدن صنعت نفت', type: 'official' },
];

export const FIXED_ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
  { month: 1, day: 9, title: 'تاسوعای حسینی', type: 'official' },
  { month: 1, day: 10, title: 'عاشورای حسینی', type: 'official' },
  { month: 2, day: 20, title: 'اربعین حسینی', type: 'official' },
  { month: 2, day: 28, title: 'رحلت پیامبر و شهادت امام حسن مجتبی', type: 'official' },
  { month: 2, day: 30, title: 'شهادت امام رضا', type: 'official' },
  { month: 3, day: 8, title: 'شهادت امام حسن عسکری', type: 'official' },
  { month: 3, day: 17, title: 'میلاد پیامبر و امام جعفر صادق', type: 'official' },
  { month: 6, day: 3, title: 'شهادت حضرت فاطمه', type: 'official' },
  { month: 7, day: 13, title: 'میلاد امام علی', type: 'official' },
  { month: 7, day: 27, title: 'مبعث پیامبر', type: 'official' },
  { month: 8, day: 15, title: 'میلاد امام زمان', type: 'official' },
  { month: 9, day: 21, title: 'شهادت امام علی', type: 'official' },
  { month: 10, day: 1, title: 'عید فطر', type: 'official' },
  { month: 10, day: 2, title: 'عید فطر (روز دوم)', type: 'official' },
  { month: 10, day: 25, title: 'شهادت امام جعفر صادق', type: 'official' },
  { month: 12, day: 10, title: 'عید قربان', type: 'official' },
  { month: 12, day: 18, title: 'عید غدیر', type: 'official' },
];

export type JalaliHolidayResult = JalaliHoliday & { year: number };
export type IslamicHolidayResult = IslamicHoliday & { year: number };

export function listJalaliHolidays(year: number): JalaliHolidayResult[] {
  return FIXED_JALALI_HOLIDAYS.map((item) => ({ ...item, year }));
}

export function listIslamicHolidays(year: number): IslamicHolidayResult[] {
  const offset = ISLAMIC_YEAR_OFFSETS[year] ?? 0;
  return FIXED_ISLAMIC_HOLIDAYS.map((item) => {
    const shifted = shiftIslamicDate({ year, month: item.month, day: item.day }, offset);
    return { ...item, year: shifted.year, month: shifted.month, day: shifted.day };
  });
}

export function getJalaliHoliday(date: DateParts): JalaliHolidayResult | null {
  const match = FIXED_JALALI_HOLIDAYS.find(
    (holiday) => holiday.month === date.month && holiday.day === date.day,
  );
  if (!match) {
    return null;
  }
  return { ...match, year: date.year };
}

export function getIslamicHoliday(date: DateParts): IslamicHolidayResult | null {
  const offset = ISLAMIC_YEAR_OFFSETS[date.year] ?? 0;
  const adjusted = shiftIslamicDate(date, offset);
  const match = FIXED_ISLAMIC_HOLIDAYS.find(
    (holiday) => holiday.month === adjusted.month && holiday.day === adjusted.day,
  );
  if (!match) {
    return null;
  }
  return { ...match, year: date.year };
}

function shiftIslamicDate(date: DateParts, offsetDays: number): DateParts {
  if (offsetDays === 0) {
    return date;
  }
  let year = date.year;
  let month = date.month;
  let day = date.day;
  let remaining = offsetDays;
  while (remaining !== 0) {
    const step = remaining > 0 ? 1 : -1;
    day += step;
    if (day > daysInIslamicMonth(year, month)) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    } else if (day < 1) {
      month -= 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      day = daysInIslamicMonth(year, month);
    }
    remaining -= step;
  }
  return { year, month, day };
}
