import { describe, expect, it } from 'vitest';
import {
  convertPersianAddressPart,
  convertPersianAddressToEnglish,
  normalizeAddressText,
} from './address-fa-to-en';

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

    expect(output.addressLine1).toContain('Street Valiasr');
    expect(output.addressLine1).toContain('Alley Yas');
    expect(output.addressLine1).toContain('No. 12');
    expect(output.addressLine1).toContain('Unit 5');
    expect(output.addressLine1).toContain('Floor 3');
    expect(output.addressLine2).toContain('District Vanak');
    expect(output.addressLine2).toContain('Near Bank');
    expect(output.postalCode).toBe('1234567890');
    expect(output.country).toBe('Iran');
    expect(output.city).toBe('Tehran');
    expect(output.mode).toBe('strict-postal');
    expect(output.confidence).toBe('dictionary');
    expect(output.reviewTerms).toEqual([]);
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

    expect(output.addressLine1).toContain('Boulevard Keshavarz');
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
    expect(output.stateProvince).toBe('Fars');
    expect(output.addressLine1).toContain('Street Zand');
    expect(output.singleLine).toContain('Iran');
  });

  it.each([
    ['ونک', 'Vanak'],
    ['و‌نک', 'Vanak'],
    ['ونك', 'Vanak'],
    ['\u200fونک\u200e', 'Vanak'],
    ['ده ونک', 'Deh-e Vanak'],
    ['میدان ونک', 'Vanak Square'],
  ])('converts canonical and Unicode Vanak variants: %s', (input, expected) => {
    expect(convertPersianAddressPart(input, 'district').text).toBe(expected);
  });

  it('uses longest dictionary match before generic address terms', () => {
    expect(convertPersianAddressPart('شهرک غرب', 'district').text).toBe('Shahrak-e Gharb');
    expect(convertPersianAddressPart('میدان ونک', 'district').text).toBe('Vanak Square');
  });

  it('does not replace conceptual words inside proper names', () => {
    expect(convertPersianAddressPart('ایرانشهر', 'city').text).toBe('Iranshahr');
    expect(convertPersianAddressPart('شهرکرد', 'city').text).toBe('Shahrekord');
  });

  it('marks unknown names for review instead of presenting them as verified', () => {
    const result = convertPersianAddressPart('کوچه گلپر', 'alley');

    expect(result.text).toBe('Alley Glpr');
    expect(result.reviewTerms).toEqual(['گلپر']);

    const output = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      street: 'خیابان گلپر',
      plaqueNo: '1',
    });
    expect(output.confidence).toBe('mixed');
    expect(output.reviewTerms).toEqual(['گلپر']);
  });

  it('normalizes invisible characters, Arabic variants and non-breaking spaces', () => {
    expect(normalizeAddressText('  و\u200cنك\u00a0  ')).toBe('ونک');
    expect(normalizeAddressText('\u202bتهران\u202c')).toBe('تهران');
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
