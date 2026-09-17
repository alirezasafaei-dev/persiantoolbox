import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  differenceInDays,
  isValidJalaliDate,
  jalaliToGregorian,
} from '@/features/date-tools/date-tools.logic';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('date difference SEO and calendar contract', () => {
  it('calculates consecutive Jalali dates as one day apart', () => {
    const start = { year: 1405, month: 1, day: 1 };
    const end = { year: 1405, month: 1, day: 2 };

    expect(isValidJalaliDate(start)).toBe(true);
    expect(isValidJalaliDate(end)).toBe(true);
    expect(differenceInDays(jalaliToGregorian(1405, 1, 1), jalaliToGregorian(1405, 1, 2))).toBe(1);
  });

  it('advertises only calendar modes implemented by the component', () => {
    const tool = getToolWithMetadataOverride('/date-tools/date-difference');
    const component = readSource('components/features/date-tools/DateDifference.tsx');

    expect(tool.description).toContain('شمسی');
    expect(tool.description).toContain('میلادی');
    expect(component).toContain("useState<SupportedCalendar>('jalali')");
    expect(component).toContain('isValidJalaliDate');
    expect(component).toContain('isValidGregorianDate');
    expect(component).toContain('jalaliToGregorian');
  });

  it('keeps the established canonical route unchanged', () => {
    const tool = getToolWithMetadataOverride('/date-tools/date-difference');
    const page = readSource('app/(tools)/date-tools/date-difference/page.tsx');

    expect(tool.path).toBe('/date-tools/date-difference');
    expect(page).toContain("getToolWithMetadataOverride('/date-tools/date-difference')");
    expect(page).toContain('path: tool.path');
    expect(page).not.toContain('permanentRedirect');
  });
});
