import { describe, expect, it } from 'vitest';
import { convertPersianAddressToEnglish, type PersianAddressInput } from './address-fa-to-en';

const base: PersianAddressInput = {
  country: 'ایران',
  province: 'تهران',
  city: 'تهران',
  street: 'خیابان ولیعصر',
  plaqueNo: '۱۲',
};

// Synthetic fixtures. Alternate spellings are acceptable when identity is preserved;
// these literals pin the existing dictionary convention rather than a legal spelling.
const scenarios: Array<[string, Partial<PersianAddressInput>, string, string]> = [
  ['ordinary', {}, 'addressLine1', 'Street Valiasr, No. 12'],
  [
    'name containing postal term',
    { street: 'خیابان فرشته' },
    'addressLine1',
    'Street Fereshteh, No. 12',
  ],
  ['name containing city', { street: 'خیابان شهرزاد' }, 'addressLine1', 'Street Shahrzad, No. 12'],
  ['name containing bridge', { street: 'خیابان پلور' }, 'addressLine1', 'Street Polur, No. 12'],
  ['pasted ZWNJ', { street: 'خیابان‌ولیعصر' }, 'addressLine1', 'Street Valiasr, No. 12'],
  [
    'pasted zero-width space',
    { street: 'خیابان\u200bفرشته' },
    'addressLine1',
    'Street Fereshteh, No. 12',
  ],
  ['pasted NBSP', { street: 'خیابان\u00a0شهرزاد' }, 'addressLine1', 'Street Shahrzad, No. 12'],
  ['messy whitespace', { street: '  خیابان   ولیعصر  ' }, 'addressLine1', 'Street Valiasr, No. 12'],
  ['Latin plaque', { plaqueNo: '0042' }, 'addressLine1', 'Street Valiasr, No. 0042'],
  ['Arabic digits', { plaqueNo: '١٢' }, 'addressLine1', 'Street Valiasr, No. 12'],
  ['unit', { unit: '۰۵' }, 'addressLine1', 'Street Valiasr, No. 12, Unit 05'],
  ['floor', { floor: '۳' }, 'addressLine1', 'Street Valiasr, No. 12, Floor 3'],
  ['leading-zero postal code', { postalCode: '۰۱۲۳۴۵۶۷۸۹' }, 'postalCode', '0123456789'],
  ['Latin postal code', { postalCode: '1234567890' }, 'postalCode', '1234567890'],
  ['city identity', { city: 'شهرکرد' }, 'city', 'Shahrekord'],
  ['compound city', { city: 'بندرعباس' }, 'city', 'Bandar Abbas'],
  ['province direction', { province: 'آذربایجان شرقی' }, 'stateProvince', 'East Azerbaijan'],
  ['district identity', { district: 'ونک' }, 'addressLine2', 'Vanak'],
  ['incomplete street', { street: '' }, 'addressLine1', 'No. 12'],
  [
    'empty optional fields',
    { alley: '', landmark: '', unit: '' },
    'addressLine1',
    'Street Valiasr, No. 12',
  ],
  [
    'long repeated street',
    { street: Array(30).fill('خیابان ولیعصر').join(' ') },
    'addressLine1',
    `${Array(30).fill('Street Valiasr').join(' ')}, No. 12`,
  ],
];

describe('synthetic address audit', () => {
  it.each(scenarios)('%s', (_name, input, field, expected) => {
    const result = convertPersianAddressToEnglish({ ...base, ...input });
    expect(result[field as keyof typeof result]).toBe(expected);
    expect(result.singleLine).not.toMatch(/[۰-۹٠-٩]|,,/);
  });
});
