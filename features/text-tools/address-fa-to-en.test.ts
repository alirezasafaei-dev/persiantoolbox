import { describe, expect, it } from 'vitest';
import { convertPersianAddressToEnglish } from './address-fa-to-en';

describe('address-fa-to-en', () => {
  it('builds postal-format output from required and optional fields', () => {
    const output = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'محله ونک',
      street: 'خیابان ولیعصر',
      alley: 'کوچه یاس',
      plaqueNo: '12',
      unit: '5',
      floor: '3',
      postalCode: '1234567890',
      landmark: 'جنب بانک',
    });

    expect(output.addressLine1).toContain('Street');
    expect(output.addressLine1).toContain('No. 12');
    expect(output.addressLine1).toContain('Unit 5');
    expect(output.addressLine1).toContain('Floor 3');
    expect(output.addressLine2).toContain('District');
    expect(output.postalCode).toBe('1234567890');
    expect(output.country).toBe('Iran');
    expect(output.city).toBe('Tehran');
    expect(output.mode).toBe('strict-postal');
    expect(output.singleLine).toContain(output.city);
    expect(output.singleLine).toContain(output.stateProvince);
  });

  it('normalizes Persian digits and keeps separators clean', () => {
    const output = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'اصفهان',
      city: 'اصفهان',
      street: 'بلوار کشاورز',
      plaqueNo: '۱۲',
      postalCode: '۱۱۹۸۷۶۵۴۳۲',
    });

    expect(output.addressLine1).toContain('Boulevard');
    expect(output.addressLine1).toContain('No. 12');
    expect(output.postalCode).toBe('1198765432');
    expect(output.singleLine).not.toContain(',,');
  });

  it('falls back to Iran when country is empty', () => {
    const output = convertPersianAddressToEnglish({
      country: '',
      province: 'فارس',
      city: 'شیراز',
      street: 'خیابان زند',
      plaqueNo: '22',
    });

    expect(output.country).toBe('Iran');
    expect(output.singleLine).toContain('Iran');
  });

  it('uses phrase overrides for common Iranian address names', () => {
    const output = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      street: 'خیابان ولیعصر',
      alley: 'کوچه یاس',
      plaqueNo: '40',
    });

    expect(output.addressLine1).toContain('Street Valiasr');
    expect(output.addressLine1).toContain('Alley Yas');
    expect(output.country).toBe('Iran');
  });

  it('handles directional and title words with cleaner postal spelling', () => {
    const output = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'آذربایجان شرقی',
      city: 'تبریز',
      street: 'خیابان شهید بهشتی شمالی',
      alley: 'کوچه فرعی ۲',
      plaqueNo: '8',
    });

    expect(output.stateProvince).toBe('East Azerbaijan');
    expect(output.city).toBe('Tabriz');
    expect(output.addressLine1).toContain('Street Shahid Beheshti North');
    expect(output.addressLine1).toContain('Alley Sub 2');
  });

  it('supports readable mode for user-facing format', () => {
    const output = convertPersianAddressToEnglish(
      {
        country: 'ایران',
        province: 'تهران',
        city: 'تهران',
        street: 'خیابان ولیعصر',
        plaqueNo: '10',
        postalCode: '1234567890',
      },
      { mode: 'readable' },
    );

    expect(output.mode).toBe('readable');
    expect(output.addressLine1).toContain('Plaque 10');
    expect(output.singleLine).toContain('Tehran - Tehran');
    expect(output.singleLine).toContain('Iran (1234567890)');
  });
});
