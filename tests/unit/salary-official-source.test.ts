import { describe, expect, it } from 'vitest';
import data from '@/data/salary-laws/v1.json';
import { getFinanceDataVersion } from '@/lib/finance-data-version';

describe('Ministry circular 6682 wage corrections', () => {
  it('retains unresolved tax and insurance review instead of stamping a full refresh', () => {
    expect(data.review.status).toBe('partial');
    expect(data.review.pending).toContain('taxBrackets');
    expect(data.review.pending).toContain('insuranceRules');
    expect(data.review.reviewedAt).toBe('2026-11-06');
    expect(data.updatedAt).toBe('2026-04-26');
    expect(data.review.sourceUrl).toMatch(/^https:\/\/www\.mcls\.gov\.ir\//);
  });
  it('converts daily rial wages to a 30-day monthly toman amount', () => {
    expect(data.review.dailyMinimumWageRial).toBe(5_541_850);
    expect(data.review.dailySeniorityRial).toBe(166_667);
    expect(data.review.monthlyReferenceDays).toBe(30);
    expect(data.review.sourceSha256).toBe(
      '3a48fa71fbc7a3219ac8ba5f6a0cc88574493bfc2d69828df68176b8ca7aa65a',
    );
    expect(data.review.verified).toEqual([
      'minimumWage',
      'seniorityAllowance',
      'foodAllowance',
      'marriageAllowance',
    ]);
    expect(data.years['2026'].minimumWage).toBe(
      (data.review.dailyMinimumWageRial * data.review.monthlyReferenceDays) / 10,
    );
    expect(data.years['2026'].seniorityAllowance).toBe(
      (data.review.dailySeniorityRial * data.review.monthlyReferenceDays) / 10,
    );
  });

  it('uses the actual dataset metadata for the salary version badge', () => {
    const badge = getFinanceDataVersion('salary');
    expect(badge?.updatedAt).toBe(data.updatedAt);
    expect(badge?.version).toBe(data.version);
    expect(badge?.description).not.toContain('۱۵,۰۶۶,۹۰۴');
  });
});
