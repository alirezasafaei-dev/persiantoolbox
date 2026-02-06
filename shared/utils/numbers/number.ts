const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;
const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

const faToEnMap: Record<(typeof faDigits)[number], (typeof enDigits)[number]> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

const arToEnMap: Record<(typeof arDigits)[number], (typeof enDigits)[number]> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const faDigitRegex = /[۰-۹٠-٩]/g;
const rtlMarkersRegex = /[\u200e\u200f\u202a-\u202e]/g;

const faNumberFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
const faMoneyFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });

function normalizeNumericInput(input: string): string {
  return toEnglishDigits(input)
    .trim()
    .replaceAll(',', '')
    .replace(/\s+/g, '')
    .replace(rtlMarkersRegex, '');
}

/**
 * Normalize Persian/Arabic digits into ASCII digits.
 * Complexity: O(n) where n is input length.
 */
export function toEnglishDigits(input: string): string {
  return input
    .replace(faDigitRegex, (digit) => {
      if (digit in faToEnMap) {
        return faToEnMap[digit as keyof typeof faToEnMap];
      }
      return arToEnMap[digit as keyof typeof arToEnMap];
    })
    .replaceAll('٬', ',')
    .replaceAll('٫', '.');
}

/**
 * Parse a number from loose user input (Persian/English digits, separators).
 * Complexity: O(n) where n is input length.
 */
export function parseLooseNumber(input: string): number | null {
  const normalized = normalizeNumericInput(input);

  if (normalized.length === 0) {
    return null;
  }

  if (!/^-?(?:\d+|\d*\.\d+)$/.test(normalized)) {
    return null;
  }

  const n = Number(normalized);
  if (!Number.isFinite(n)) {
    return null;
  }
  return n;
}

/**
 * Format a number with Persian digits and separators.
 * Complexity: O(1) per Intl.NumberFormat implementation.
 */
export function formatNumberFa(n: number): string {
  return faNumberFormatter.format(n);
}

/**
 * Format currency-style numbers without fractional digits.
 * Complexity: O(1) per Intl.NumberFormat implementation.
 */
export function formatMoneyFa(n: number): string {
  return faMoneyFormatter.format(n);
}

const faOnes = ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'] as const;

const faTeens = [
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
] as const;

const faTens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'] as const;

const faHundreds = [
  '',
  'صد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
] as const;

const faScales = [
  { value: 1_000_000_000, label: 'میلیارد' },
  { value: 1_000_000, label: 'میلیون' },
  { value: 1_000, label: 'هزار' },
] as const;

function threeDigitToWords(n: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  if (hundreds > 0) {
    const word = faHundreds[hundreds];
    if (word) {
      parts.push(word);
    }
  }
  if (remainder > 0) {
    if (remainder < 10) {
      const word = faOnes[remainder];
      if (word) {
        parts.push(word);
      }
    } else if (remainder < 20) {
      const word = faTeens[remainder - 10];
      if (word) {
        parts.push(word);
      }
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      const tensWord = faTens[tens];
      if (tensWord) {
        parts.push(tensWord);
      }
      if (ones > 0) {
        const onesWord = faOnes[ones];
        if (onesWord) {
          parts.push(onesWord);
        }
      }
    }
  }
  return parts.join(' و ');
}

/**
 * Convert a number into Persian words (supports fractions up to 6 digits).
 * Complexity: O(d) where d is number of digits.
 */
export function numberToWordsFa(input: number): string {
  if (!Number.isFinite(input)) {
    return '';
  }
  if (input === 0) {
    return faOnes[0];
  }

  const negative = input < 0;
  const absolute = Math.abs(input);
  const integerPart = Math.trunc(absolute);
  const fractionRaw = absolute - integerPart;
  const integerWords: string[] = [];

  let remainder = integerPart;
  for (const scale of faScales) {
    if (remainder >= scale.value) {
      const chunk = Math.floor(remainder / scale.value);
      remainder %= scale.value;
      const chunkWords = threeDigitToWords(chunk);
      if (chunkWords) {
        integerWords.push(`${chunkWords} ${scale.label}`);
      }
    }
  }

  if (remainder > 0) {
    integerWords.push(threeDigitToWords(remainder));
  }

  const integerText = integerWords.join(' و ');
  if (fractionRaw <= 0) {
    return negative ? `منفی ${integerText}` : integerText;
  }

  const fractionDigits = fractionRaw.toFixed(6).split('.')[1]?.replace(/0+$/, '');
  if (!fractionDigits) {
    return negative ? `منفی ${integerText}` : integerText;
  }

  const fractionWords = fractionDigits
    .split('')
    .map((digit) => faOnes[Number(digit)])
    .join(' ');

  const result = `${integerText} ممیز ${fractionWords}`;
  return negative ? `منفی ${result}` : result;
}
