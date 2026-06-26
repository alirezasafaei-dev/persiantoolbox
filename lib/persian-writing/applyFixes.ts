import type { PersianWritingConfig, CleanupResult } from './types';
import { normalizeArabicToPersian } from './normalizeCharacters';
import { normalizeDigits } from './normalizeDigits';
import { removeExtraSpaces, normalizeLineBreaks, fixPunctuationSpacing } from './normalizeSpacing';
import { normalizePunctuation } from './normalizePunctuation';
import { normalizeZwnj } from './normalizeZwnj';
import { detectIssues } from './detectIssues';
import { calculateStats } from './textStats';

export function applyFixes(text: string, config: PersianWritingConfig): CleanupResult {
  let result = text;

  if (config.normalizeArabicLetters) {
    result = normalizeArabicToPersian(result);
  }
  if (config.normalizeDigits) {
    result = normalizeDigits(result);
  }
  if (config.removeExtraSpaces) {
    result = removeExtraSpaces(result);
  }
  if (config.normalizeLineBreaks) {
    result = normalizeLineBreaks(result);
  }
  if (config.fixPunctuationSpacing) {
    result = fixPunctuationSpacing(result);
  }
  if (config.normalizePunctuation) {
    result = normalizePunctuation(result);
  }
  if (config.normalizeZwnj) {
    result = normalizeZwnj(result);
  }

  const issues = detectIssues(text, result);

  return {
    originalText: text,
    cleanedText: result,
    issues,
    totalChanges: text !== result ? 1 : 0,
    stats: calculateStats(result),
  };
}
