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
});
