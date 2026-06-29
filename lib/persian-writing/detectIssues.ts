import type { CleanupIssue, CleanupMode } from './types';

export function detectIssues(original: string, cleaned: string, mode: CleanupMode = 'standard'): CleanupIssue[] {
  const issues: CleanupIssue[] = [];

  const arabicYCount = (original.match(/ي/g) ?? []).length;
  const arabicKCount = (original.match(/ك/g) ?? []).length;
  if (arabicYCount + arabicKCount > 0) {
    issues.push({
      category: 'حروف عربی',
      count: arabicYCount + arabicKCount,
      description: `تبدیل ${arabicYCount + arabicKCount} حرف عربی (ي/ك) به معادل فارسی`,
    });
  }

  const origSpaces = (original.match(/ {2,}/g) ?? []).length;
  if (origSpaces > 0) {
    issues.push({
      category: 'فضاهای اضافی',
      count: origSpaces,
      description: `حذف ${origSpaces} فضای اضافی`,
    });
  }

  const commaBefore = (original.match(/ +[،.؟؛:!]/g) ?? []).length;
  if (commaBefore > 0) {
    issues.push({
      category: 'فاصله علائم نگارشی',
      count: commaBefore,
      description: `اصلاح ${commaBefore} فاصله قبل از علامت نگارشی`,
    });
  }

  const zwnjAdded = (cleaned.match(/‌/g) ?? []).length - (original.match(/‌/g) ?? []).length;
  if (zwnjAdded > 0) {
    issues.push({
      category: 'نیم‌فاصله',
      count: zwnjAdded,
      description: `افزودن ${zwnjAdded} نیم‌فاصله`,
    });
  }

  const repeatedWords = original.match(/(\w+)\s+\1/g);
  if (repeatedWords && repeatedWords.length > 0) {
    issues.push({
      category: 'کلمات تکراری',
      count: repeatedWords.length,
      description: `${repeatedWords.length} کلمه تکراری شناسایی شد`,
    });
  }

  const arabicCommas = (original.match(/,/g) ?? []).length;
  const arabicQuestions = (original.match(/\?/g) ?? []).length;
  if (arabicCommas + arabicQuestions > 0) {
    issues.push({
      category: 'علائم نگارشی',
      count: arabicCommas + arabicQuestions,
      description: `تبدیل ${arabicCommas + arabicQuestions} علامت نگارشی`,
    });
  }

  if (mode === 'strict') {
    const keshideCount = (original.match(/ـ+/g) ?? []).length;
    if (keshideCount > 0) {
      issues.push({
        category: 'کشیده',
        count: keshideCount,
        description: `حذف ${keshideCount} کشیده غیراستاندارد`,
      });
    }

    const extraZwnj = (original.match(/\u200C{2,}/g) ?? []).length;
    if (extraZwnj > 0) {
      issues.push({
        category: 'نیم‌فاصله اضافی',
        count: extraZwnj,
        description: `اصلاح ${extraZwnj} نیم‌فاصله اضافی`,
      });
    }

    const leadingSpaces = (original.match(/(^|\n)\s+/gm) ?? []).length;
    if (leadingSpaces > 0) {
      issues.push({
        category: 'فاصله ابتدای خط',
        count: leadingSpaces,
        description: `حذف ${leadingSpaces} فاصله ابتدای خط`,
      });
    }
  }

  return issues;
}
