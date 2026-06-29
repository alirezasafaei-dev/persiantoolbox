import type { PersianWritingConfig, CleanupResult } from './types';
import { normalizeArabicToPersian } from './normalizeCharacters';
import { normalizeDigits } from './normalizeDigits';
import { removeExtraSpaces, normalizeLineBreaks, fixPunctuationSpacing } from './normalizeSpacing';
import { normalizePunctuation } from './normalizePunctuation';
import { normalizeZwnj } from './normalizeZwnj';
import { detectIssues } from './detectIssues';
import { calculateStats } from './textStats';

function protectSensitiveContent(text: string): { clean: string; restore: (s: string) => string } {
  const placeholders: string[] = [];
  let clean = text;
  const patterns = [
    /https?:\/\/[^\s]+/g,
    /www\.[^\s]+/g,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    /0\d{10}/g,
  ];
  for (const pattern of patterns) {
    clean = clean.replace(pattern, (match) => {
      const idx = placeholders.length;
      placeholders.push(match);
      return `\x00PROTECTED${String.fromCharCode(65 + idx)}\x00`;
    });
  }
  return {
    clean,
    restore: (s: string) => {
      let result = s;
      for (let i = 0; i < placeholders.length; i++) {
        const placeholder = placeholders[i];
        if (placeholder !== undefined) {
          const key = `\x00PROTECTED${String.fromCharCode(65 + i)}\x00`;
          result = result.split(key).join(placeholder);
        }
      }
      return result;
    },
  };
}

export function applyFixes(text: string, config: PersianWritingConfig): CleanupResult {
  const { clean: protectedText, restore } = protectSensitiveContent(text);
  let result = protectedText;

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

  if (config.mode === 'strict') {
    result = result
      .replace(/ـ+/g, '')
      .replace(/\u200C{2,}/g, '\u200C')
      .replace(/(^|\n)\s+/gm, '$1');
  }

  result = restore(result);

  const issues = detectIssues(text, result, config.mode);

  return {
    originalText: text,
    cleanedText: result,
    issues,
    totalChanges: text !== result ? 1 : 0,
    stats: calculateStats(result),
  };
}
