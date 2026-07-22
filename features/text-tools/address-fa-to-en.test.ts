import { describe, expect, it } from 'vitest';
import {
  applyAddressOutputCorrections,
  buildPersianAddressQuery,
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

  it('uses longest matches and protects proper names from term replacement', () => {
    expect(convertPersianAddressPart('شهرک غرب', 'district').text).toBe('Shahrak-e Gharb');
    expect(convertPersianAddressPart('ایرانشهر', 'city').text).toBe('Iranshahr');
    expect(convertPersianAddressPart('شهرکرد', 'city').text).toBe('Shahrekord');
    expect(convertPersianAddressPart('میدان ونک', 'landmark').text).toBe('Vanak Square');
  });

  it('does not replace dictionary entries inside longer unknown words', () => {
    const result = convertPersianAddressPart('تهرانپارس', 'district');

    expect(result.text).not.toContain('Tehran');
    expect(result.reviewTerms).toContain('تهرانپارس');
  });

  it('marks unknown names for review instead of presenting them as verified', () => {
    const result = convertPersianAddressPart('کوچه گلپر', 'alley');

    expect(result.text).toBe('Alley Glpr');
    expect(result.reviewTerms).toEqual(['گلپر']);
  });

  it('normalizes Persian digits, Arabic variants and invisible characters', () => {
    expect(normalizeAddressText('  و\u200cنك\u00a0  ')).toBe('ونک');
    expect(normalizeAddressText('\u202bتهران\u202c')).toBe('تهران');

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
  });

  it('applies manual corrections to single-line and structured output', () => {
    const output = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'ونک',
      street: 'خیابان گلپر',
      plaqueNo: '1',
    });

    const corrected = applyAddressOutputCorrections(output, {
      addressLine1: 'Golpar Street, No. 1',
      city: 'Tehran City',
    });

    expect(corrected.addressLine1).toBe('Golpar Street, No. 1');
    expect(corrected.city).toBe('Tehran City');
    expect(corrected.singleLine).toContain('Golpar Street, No. 1');
    expect(corrected.singleLine).toContain('Tehran City');
    expect(corrected.singleLine).not.toContain('Glpr');
  });

  it('builds map validation queries from the original Persian address', () => {
    const query = buildPersianAddressQuery({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'ونک',
      street: 'خیابان ولیعصر',
      plaqueNo: '۱۲',
    });

    expect(query).toContain('ونک');
    expect(query).toContain('خیابان ولیعصر');
    expect(query).toContain('پلاک 12');
    expect(query).not.toContain('Vanak');
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
