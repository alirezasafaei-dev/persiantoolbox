import { toEnglishDigits } from '@/shared/utils/numbers';

export type PersianAddressInput = {
  country: string;
  province: string;
  city: string;
  district?: string;
  street: string;
  alley?: string;
  plaqueNo: string;
  unit?: string;
  floor?: string;
  postalCode?: string;
  landmark?: string;
};

export type EnglishAddressOutput = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  singleLine: string;
};

const conceptualTerms: Array<[RegExp, string]> = [
  [/خیابان/g, 'Street'],
  [/بلوار/g, 'Boulevard'],
  [/کوچه/g, 'Alley'],
  [/بن[\u200c\s-]?بست/g, 'Dead End'],
  [/میدان/g, 'Square'],
  [/اتوبان/g, 'Expressway'],
  [/بزرگراه/g, 'Highway'],
  [/پلاک/g, 'No.'],
  [/واحد/g, 'Unit'],
  [/طبقه/g, 'Floor'],
  [/محله/g, 'District'],
  [/استان/g, 'Province'],
  [/شهر/g, 'City'],
];

const transliterationMap: Record<string, string> = {
  آ: 'a',
  ا: 'a',
  ب: 'b',
  پ: 'p',
  ت: 't',
  ث: 's',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'z',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'gh',
  ک: 'k',
  گ: 'g',
  ل: 'l',
  م: 'm',
  ن: 'n',
  و: 'v',
  ه: 'h',
  ی: 'y',
  ئ: 'y',
  ء: 'a',
  ة: 'h',
};

function normalizeText(value: string | undefined): string {
  return toEnglishDigits(value ?? '')
    .replace(/[،؛]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function transliterateWord(word: string): string {
  const lower = word
    .split('')
    .map((char) => transliterationMap[char] ?? char)
    .join('');
  if (!lower) {
    return lower;
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function transliteratePersian(text: string): string {
  return text
    .split(' ')
    .map((segment) => transliterateWord(segment))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function convertField(value: string | undefined): string {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }
  const conceptual = conceptualTerms.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    normalized,
  );
  return transliteratePersian(conceptual);
}

function compact(parts: Array<string | undefined>): string {
  return parts
    .map((item) => item?.trim() ?? '')
    .filter(Boolean)
    .join(', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s+,/g, ', ')
    .trim();
}

export function convertPersianAddressToEnglish(input: PersianAddressInput): EnglishAddressOutput {
  const street = convertField(input.street);
  const alley = convertField(input.alley);
  const district = convertField(input.district);
  const landmark = convertField(input.landmark);
  const city = convertField(input.city);
  const stateProvince = convertField(input.province);
  const country = convertField(input.country || 'Iran') || 'Iran';
  const plaqueNo = normalizeText(input.plaqueNo);
  const unit = normalizeText(input.unit);
  const floor = normalizeText(input.floor);
  const postalCode = normalizeText(input.postalCode);

  const addressLine1 = compact([
    street,
    alley,
    plaqueNo ? `No. ${plaqueNo}` : '',
    unit ? `Unit ${unit}` : '',
    floor ? `Floor ${floor}` : '',
  ]);

  const addressLine2 = compact([district, landmark]);

  return {
    addressLine1,
    addressLine2,
    city,
    stateProvince,
    country,
    postalCode,
    singleLine: compact([addressLine1, addressLine2, city, stateProvince, country, postalCode]),
  };
}
