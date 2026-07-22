import { describe, it, expect } from 'vitest';
import { convertPersianAddressToEnglish } from '@/features/text-tools/address-fa-to-en';

describe('Address FA to EN', () => {
  it('converts ونک to Vanak', () => {
    const result = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'ونک',
      street: 'ولیعصر',
      alley: '',
      plaqueNo: '12',
      unit: '3',
    });
    expect(result.addressLine2).toContain('Vanak');
  });

  it('converts و\u200cنک (with ZWNJ) to Vanak', () => {
    const result = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'و\u200cنک',
      street: 'ولیعصر',
      alley: '',
      plaqueNo: '12',
      unit: '3',
    });
    expect(result.addressLine2).toContain('Vanak');
  });

  it('converts ونك (with Arabic kaf) to Vanak', () => {
    const result = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'ونك',
      street: 'ولیعصر',
      alley: '',
      plaqueNo: '12',
      unit: '3',
    });
    expect(result.addressLine2).toContain('Vanak');
  });

  it('converts شهرک غرب to Shahrak-e Gharb', () => {
    const result = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: 'شهرک غرب',
      street: '',
      alley: '',
      plaqueNo: '5',
    });
    expect(result.addressLine2).toContain('Shahrak');
  });

  it('does not convert IranCity for ایرانشهر', () => {
    const result = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'سیستان و بلوچستان',
      city: 'ایرانشهر',
      street: '',
      alley: '',
      plaqueNo: '1',
    });
    expect(result.city).not.toContain('IranCity');
  });

  it('converts میدان ونک to Vanak Square', () => {
    const result = convertPersianAddressToEnglish({
      country: 'ایران',
      province: 'تهران',
      city: 'تهران',
      district: '',
      street: 'میدان ونک',
      alley: '',
      plaqueNo: '1',
    });
    expect(result.addressLine1).toContain('Vanak Square');
  });
});
