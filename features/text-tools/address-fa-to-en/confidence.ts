import { normalizeAddressText } from '../address-fa-to-en';
import { ADDRESS_NAME_ENTRIES } from '../address-fa-to-en-data';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ConfidenceResult = {
  level: ConfidenceLevel;
  score: number;
  reason: string;
};

export type FieldConfidenceMap = Record<string, ConfidenceResult>;

const canonicalNames = new Map(
  ADDRESS_NAME_ENTRIES.map(([persian, english]) => [normalizeAddressText(persian), english]),
);

const numericFields = new Set(['plaqueNo', 'unit', 'floor', 'postalCode']);
const ruleBasedEnglishTerms = [
  'Street',
  'Boulevard',
  'Alley',
  'Square',
  'Crossroad',
  'Expressway',
  'Highway',
  'Road',
  'No.',
  'Unit',
  'Floor',
  'District',
  'Province',
  'City',
  'North',
  'South',
  'East',
  'West',
  'Corner of',
  'Dead End',
];

function isGazetteerMatch(persian: string, english: string): boolean {
  return canonicalNames.get(normalizeAddressText(persian)) === english.trim();
}

function isRuleBasedMatch(english: string): boolean {
  const normalizedEnglish = english.trim().toLowerCase();
  return ruleBasedEnglishTerms.some((term) =>
    normalizedEnglish.includes(term.toLowerCase()),
  );
}

export function calculateConfidence(
  persian: string,
  english: string,
  field: string,
): ConfidenceResult {
  if (!persian.trim() || !english.trim()) {
    return { level: 'high', score: 100, reason: 'خالی — نیازی به بررسی نیست' };
  }

  if (numericFields.has(field)) {
    return { level: 'high', score: 100, reason: 'عدد استانداردشده' };
  }

  if (isGazetteerMatch(persian, english)) {
    return { level: 'high', score: 95, reason: 'تأییدشده در واژه‌نامه' };
  }

  if (isRuleBasedMatch(english)) {
    return { level: 'medium', score: 70, reason: 'تبدیل قاعده‌محور' };
  }

  return { level: 'low', score: 40, reason: 'املای تخمینی — نیازمند بررسی' };
}

export function calculateAllConfidences(
  fields: Record<string, { persian: string; english: string }>,
): FieldConfidenceMap {
  const result: FieldConfidenceMap = {};
  for (const [field, { persian, english }] of Object.entries(fields)) {
    result[field] = calculateConfidence(persian, english, field);
  }
  return result;
}
