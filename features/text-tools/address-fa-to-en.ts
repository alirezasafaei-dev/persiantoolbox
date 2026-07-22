import { toEnglishDigits } from '@/shared/utils/numbers';
import {
  ADDRESS_NAME_ENTRIES,
  ADDRESS_TERM_ENTRIES,
  ADDRESS_WORD_OVERRIDES,
  PERSIAN_TRANSLITERATION_MAP,
  PRODUCTIVE_SUFFIXES,
  type AddressDictionaryEntry,
} from './address-fa-to-en-data';

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

export type AddressOutputMode = 'strict-postal' | 'readable';
export type AddressFieldKind =
  | 'country'
  | 'province'
  | 'city'
  | 'district'
  | 'street'
  | 'alley'
  | 'landmark';
export type AddressTransliterationConfidence = 'dictionary' | 'mixed';

export type EnglishAddressOutput = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  singleLine: string;
  mode: AddressOutputMode;
  confidence: AddressTransliterationConfidence;
  reviewTerms: string[];
};

export type ConvertPersianAddressOptions = {
  mode?: AddressOutputMode;
};

type ConvertedPart = {
  text: string;
  reviewTerms: string[];
};

type CompiledDictionaryEntry = {
  pattern: RegExp;
  target: string;
};

const PERSIAN_LETTER_PATTERN = /[\u0600-\u06FF]/u;
const WORD_PART_PATTERN =
  /^([^A-Za-z0-9\u0600-\u06FF]*)([A-Za-z0-9\u0600-\u06FF]+)([^A-Za-z0-9\u0600-\u06FF]*)$/u;
const SAFE_LATIN_TOKEN_PATTERN = /^[A-Za-z0-9.,\-/#()]+$/u;

export function normalizeAddressText(value: string | undefined): string {
  return toEnglishDigits(value ?? '')
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ۀة]/g, 'ه')
    .replace(/[ؤ]/g, 'و')
    .replace(/[إأ]/g, 'ا')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/ـ/g, '')
    .replace(/[،؛]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compileDictionary(entries: readonly AddressDictionaryEntry[]): CompiledDictionaryEntry[] {
  return [...entries]
    .map(([source, target]) => ({ source: normalizeAddressText(source), target }))
    .filter((entry) => entry.source.length > 0)
    .sort((left, right) => right.source.length - left.source.length)
    .map(({ source, target }) => {
      const body = source
        .split(' ')
        .filter(Boolean)
        .map(escapeRegExp)
        .join('[\\s-]*');
      return {
        pattern: new RegExp(`(^|[^\\p{L}\\p{N}])${body}(?=$|[^\\p{L}\\p{N}])`, 'giu'),
        target,
      };
    });
}

const COMPILED_ADDRESS_NAMES = compileDictionary(ADDRESS_NAME_ENTRIES);
const COMPILED_ADDRESS_TERMS = compileDictionary(ADDRESS_TERM_ENTRIES);

function replaceDictionaryEntries(text: string, entries: readonly CompiledDictionaryEntry[]): string {
  return entries.reduce(
    (current, entry) =>
      current.replace(entry.pattern, (_match, boundary: string) => `${boundary}${entry.target}`),
    text,
  );
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function transliterateCharacters(value: string): string {
  return value
    .split('')
    .map((character) => PERSIAN_TRANSLITERATION_MAP[character] ?? character)
    .join('');
}

function transliterateProductiveWord(core: string): string | null {
  for (const [suffix, latinSuffix] of PRODUCTIVE_SUFFIXES) {
    if (!core.endsWith(suffix) || core.length <= suffix.length) {
      continue;
    }
    const stem = core.slice(0, -suffix.length);
    const knownStem = ADDRESS_WORD_OVERRIDES[stem];
    if (knownStem) {
      return `${knownStem}${latinSuffix}`;
    }
  }
  return null;
}

function transliterateWord(word: string, reviewTerms: Set<string>): string {
  if (SAFE_LATIN_TOKEN_PATTERN.test(word)) {
    return word;
  }

  const match = word.match(WORD_PART_PATTERN);
  if (!match) {
    return word;
  }

  const prefix = match[1] ?? '';
  const core = match[2] ?? '';
  const suffix = match[3] ?? '';
  const overridden = ADDRESS_WORD_OVERRIDES[core];
  if (overridden) {
    return `${prefix}${overridden}${suffix}`;
  }

  const productive = transliterateProductiveWord(core);
  if (productive) {
    return `${prefix}${productive}${suffix}`;
  }

  if (!PERSIAN_LETTER_PATTERN.test(core)) {
    return word;
  }

  reviewTerms.add(core);
  return `${prefix}${capitalize(transliterateCharacters(core))}${suffix}`;
}

function transliterateRemainingText(text: string, reviewTerms: Set<string>): string {
  return text
    .split(' ')
    .map((segment) => transliterateWord(segment, reviewTerms))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function convertPersianAddressPart(
  value: string | undefined,
  kind: AddressFieldKind,
): ConvertedPart {
  const normalized = normalizeAddressText(value);
  if (!normalized) {
    return { text: '', reviewTerms: [] };
  }

  const namesReplaced = replaceDictionaryEntries(normalized, COMPILED_ADDRESS_NAMES);
  const supportsAddressTerms = !['country', 'province', 'city'].includes(kind);
  const termsReplaced = supportsAddressTerms
    ? replaceDictionaryEntries(namesReplaced, COMPILED_ADDRESS_TERMS)
    : namesReplaced;
  const reviewTerms = new Set<string>();

  return {
    text: transliterateRemainingText(termsReplaced, reviewTerms),
    reviewTerms: [...reviewTerms],
  };
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

function formatAddressLine1(
  mode: AddressOutputMode,
  street: string,
  alley: string,
  plaqueNo: string,
  unit: string,
  floor: string,
): string {
  if (mode === 'readable') {
    return compact([
      street,
      alley,
      plaqueNo ? `Plaque ${plaqueNo}` : '',
      unit ? `Unit ${unit}` : '',
      floor ? `Floor ${floor}` : '',
    ]);
  }

  return compact([
    street,
    alley,
    plaqueNo ? `No. ${plaqueNo}` : '',
    unit ? `Unit ${unit}` : '',
    floor ? `Floor ${floor}` : '',
  ]);
}

function formatSingleLine(
  mode: AddressOutputMode,
  addressLine1: string,
  addressLine2: string,
  city: string,
  stateProvince: string,
  country: string,
  postalCode: string,
): string {
  if (mode === 'readable') {
    return compact([
      addressLine1,
      addressLine2,
      city && stateProvince ? `${city} - ${stateProvince}` : city || stateProvince,
      postalCode ? `${country} (${postalCode})` : country,
    ]);
  }

  return compact([addressLine1, addressLine2, city, stateProvince, country, postalCode]);
}

export function convertPersianAddressToEnglish(
  input: PersianAddressInput,
  options: ConvertPersianAddressOptions = {},
): EnglishAddressOutput {
  const mode = options.mode ?? 'strict-postal';
  const street = convertPersianAddressPart(input.street, 'street');
  const alley = convertPersianAddressPart(input.alley, 'alley');
  const district = convertPersianAddressPart(input.district, 'district');
  const landmark = convertPersianAddressPart(input.landmark, 'landmark');
  const city = convertPersianAddressPart(input.city, 'city');
  const stateProvince = convertPersianAddressPart(input.province, 'province');
  const country = convertPersianAddressPart(input.country || 'Iran', 'country');
  const plaqueNo = normalizeAddressText(input.plaqueNo);
  const unit = normalizeAddressText(input.unit);
  const floor = normalizeAddressText(input.floor);
  const postalCode = normalizeAddressText(input.postalCode);
  const reviewTerms = [
    ...street.reviewTerms,
    ...alley.reviewTerms,
    ...district.reviewTerms,
    ...landmark.reviewTerms,
    ...city.reviewTerms,
    ...stateProvince.reviewTerms,
    ...country.reviewTerms,
  ].filter((term, index, allTerms) => allTerms.indexOf(term) === index);

  const addressLine1 = formatAddressLine1(
    mode,
    street.text,
    alley.text,
    plaqueNo,
    unit,
    floor,
  );
  const addressLine2 = compact([district.text, landmark.text]);
  const resolvedCountry = country.text || 'Iran';

  return {
    addressLine1,
    addressLine2,
    city: city.text,
    stateProvince: stateProvince.text,
    country: resolvedCountry,
    postalCode,
    singleLine: formatSingleLine(
      mode,
      addressLine1,
      addressLine2,
      city.text,
      stateProvince.text,
      resolvedCountry,
      postalCode,
    ),
    mode,
    confidence: reviewTerms.length === 0 ? 'dictionary' : 'mixed',
    reviewTerms,
  };
}
