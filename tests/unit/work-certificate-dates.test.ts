import { describe, expect, it } from 'vitest';
import { validateCertificate, type WorkCertificateData } from '@/lib/work-certificate/types';

const valid: WorkCertificateData = {
  employeeName: 'Synthetic Employee',
  employerName: 'Synthetic Employer',
  position: 'Engineer',
  startDate: '2024-02-29',
  endDate: '2025-01-01',
  isCurrent: false,
  issuerName: 'Synthetic Issuer',
  issuerPosition: 'HR Manager',
  certificateDate: '2026-11-13',
  templateId: 'formal',
};

describe('work certificate calendar dates', () => {
  it.each(['startDate', 'endDate', 'certificateDate'] as const)(
    'rejects malformed and impossible %s values',
    (field) => {
      for (const value of [
        'not-a-date',
        '2026-02-30',
        '2025-02-29',
        '2026-04-31',
        '2026-13-01',
        '2026-00-01',
        '2026-01-00',
        '0000-01-01',
        '2026-1-1',
        '2026-11-13T00:00:00Z',
      ]) {
        expect(validateCertificate({ ...valid, [field]: value }), `${field}: ${value}`).not.toEqual(
          [],
        );
      }
    },
  );

  it('rejects an employment period ending before it starts', () => {
    expect(
      validateCertificate({ ...valid, startDate: '2026-01-02', endDate: '2026-01-01' }),
    ).not.toEqual([]);
  });

  it.each([
    {},
    { startDate: '2000-02-29' },
    { startDate: '2026-01-01', endDate: '2026-01-01' },
    { endDate: '' },
    { isCurrent: true, endDate: 'not-a-date' },
    { isCurrent: true, startDate: '2026-01-01', endDate: '2025-01-01' },
  ])('accepts supported optional/current employment dates: %j', (overrides) => {
    expect(validateCertificate({ ...valid, ...overrides })).toEqual([]);
  });

  it('accepts an omitted optional end date', () => {
    const data = { ...valid };
    delete data.endDate;
    expect(validateCertificate(data)).toEqual([]);
  });
});
