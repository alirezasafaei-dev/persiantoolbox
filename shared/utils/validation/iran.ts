import { toEnglishDigits } from '@/shared/utils/numbers';

const stripSeparators = (value: string) => value.replace(/[\s-]+/g, '');

export function normalizeIranianMobile(input: string): string | null {
  const normalized = stripSeparators(toEnglishDigits(input));
  if (normalized.startsWith('+98')) {
    const rest = normalized.slice(3);
    if (/^9\d{9}$/.test(rest)) {
      return `0${rest}`;
    }
  }
  if (normalized.startsWith('0098')) {
    const rest = normalized.slice(4);
    if (/^9\d{9}$/.test(rest)) {
      return `0${rest}`;
    }
  }
  if (/^9\d{9}$/.test(normalized)) {
    return `0${normalized}`;
  }
  if (/^09\d{9}$/.test(normalized)) {
    return normalized;
  }
  return null;
}

export function isValidIranianMobile(input: string): boolean {
  return normalizeIranianMobile(input) !== null;
}

export function isValidNationalId(input: string): boolean {
  const normalized = stripSeparators(toEnglishDigits(input));
  if (!/^\d{10}$/.test(normalized)) {
    return false;
  }
  if (/^(\d)\1{9}$/.test(normalized)) {
    return false;
  }
  const digits = normalized.split('').map((d) => Number(d));
  const check = digits[9] as number;
  const sum = digits.slice(0, 9).reduce((acc, digit, index) => acc + digit * (10 - index), 0);
  const remainder = sum % 11;
  const expected = remainder < 2 ? remainder : 11 - remainder;
  return check === expected;
}

export function isValidCardNumber(input: string): boolean {
  const normalized = stripSeparators(toEnglishDigits(input));
  if (!/^\d{16}$/.test(normalized)) {
    return false;
  }
  let sum = 0;
  let shouldDouble = false;
  for (let i = normalized.length - 1; i >= 0; i -= 1) {
    let digit = Number(normalized[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidIranianSheba(input: string): boolean {
  const normalized = stripSeparators(input).toUpperCase();
  if (!/^IR\d{24}$/.test(normalized)) {
    return false;
  }
  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let expanded = '';
  for (const ch of rearranged) {
    if (/[A-Z]/.test(ch)) {
      expanded += (ch.charCodeAt(0) - 55).toString();
    } else {
      expanded += ch;
    }
  }
  let remainder = 0;
  for (let i = 0; i < expanded.length; i += 1) {
    const digit = Number(expanded[i]);
    remainder = (remainder * 10 + digit) % 97;
  }
  return remainder === 1;
}

export function isValidIranianPostalCode(input: string): boolean {
  const normalized = stripSeparators(toEnglishDigits(input));
  if (!/^\d{10}$/.test(normalized)) {
    return false;
  }
  if (/^(\d)\1{9}$/.test(normalized)) {
    return false;
  }
  return true;
}

const plateLetters = new Set([
  'الف',
  'ب',
  'پ',
  'ت',
  'ث',
  'ج',
  'د',
  'ز',
  'س',
  'ص',
  'ط',
  'ع',
  'ف',
  'ق',
  'ک',
  'گ',
  'ل',
  'م',
  'ن',
  'و',
  'ه',
  'ی',
]);

export function isValidIranianPlate(input: string): boolean {
  const normalized = stripSeparators(toEnglishDigits(input))
    .replace(/ایران/gi, '')
    .replace(/IR/gi, '');
  const match = normalized.match(/^(\d{2})([^\d])(\d{3})(\d{2})$/);
  if (!match) {
    return false;
  }
  const letter = match[2] as string;
  return plateLetters.has(letter);
}
