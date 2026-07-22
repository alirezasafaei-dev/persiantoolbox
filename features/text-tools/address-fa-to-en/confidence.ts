import { allGazetteer } from './data/gazetteer';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ConfidenceResult = {
  level: ConfidenceLevel;
  score: number;
  reason: string;
};

export type FieldConfidenceMap = Record<string, ConfidenceResult>;

function normalizeForMatch(value: string): string {
  return value
    .replace(/[\u200c\u00a0\u200b\u200d\u2060\ufeff]/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGazetteerMatch(persian: string, english: string): boolean {
  const normalized = normalizeForMatch(persian);
  return allGazetteer.some(
    (entry) => normalizeForMatch(entry.persian) === normalized && entry.english === english,
  );
}

const ruleBasedPatterns: Array<[RegExp, string]> = [
  [/خیابان/, 'Street'],
  [/بلوار/, 'Boulevard'],
  [/کوچه/, 'Alley'],
  [/میدان/, 'Square'],
  [/چهارراه/, 'Crossroad'],
  [/اتوبان/, 'Expressway'],
  [/بزرگراه/, 'Highway'],
  [/جاده/, 'Road'],
  [/پلاک/, 'No\\.'],
  [/واحد/, 'Unit'],
  [/طبقه/, 'Floor'],
  [/محله/, 'District'],
  [/استان/, 'Province'],
  [/شهر/, 'City'],
  [/شمالی/, 'North'],
  [/جنوبی/, 'South'],
  [/شرقی/, 'East'],
  [/غربی/, 'West'],
  [/نبش/, 'Corner of'],
  [/بن.?بست/, 'Dead End'],
];

function isRuleBasedMatch(_persian: string, english: string): boolean {
  return ruleBasedPatterns.some(([, en]) => new RegExp(`^${en}$`, 'i').test(english.trim()));
}

export function calculateConfidence(
  persian: string,
  english: string,
  _field: string,
): ConfidenceResult {
  if (!persian.trim() || !english.trim()) {
    return { level: 'high', score: 100, reason: 'خالی — نیازی به بررسی نیست' };
  }

  if (isGazetteerMatch(persian, english)) {
    return { level: 'high', score: 95, reason: 'تأییدشده در واژه‌نامه' };
  }

  if (isRuleBasedMatch(persian, english)) {
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
