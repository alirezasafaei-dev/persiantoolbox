import { toolsRegistry, type ToolEntry } from '@/lib/tools-registry';

const synonyms: Record<string, string[]> = {
  عکس: ['تصویر', 'image', 'photo'],
  تصویر: ['عکس', 'image', 'photo'],
  'کم کردن حجم': ['فشرده سازی', 'compression', 'compress'],
  'فشرده سازی': ['کاهش حجم', 'فشرده\u200cسازی', 'compression', 'compress'],
  'فشرده\u200cسازی': ['کاهش حجم', 'فشرده سازی', 'compression', 'compress'],
  'کاهش حجم': ['فشرده سازی', 'compression', 'compress'],
  قسط: ['وام', 'loan', 'installment'],
  وام: ['قسط', 'loan', 'installment'],
  پی‌دی‌اف: ['pdf', 'PDF'],
  pdf: ['PDF', 'پی‌دی‌اف'],
  'تاریخ شمسی': ['تبدیل تاریخ', 'shamsi', 'persian date'],
  'تبدیل تاریخ': ['تاریخ شمسی', 'date conversion'],
  'عدد به حروف': ['حروف', 'number to words', 'تبدیل عدد'],
  حروف: ['عدد به حروف', 'number to words'],
  ادغام: ['ترکیب', 'merge', 'combine'],
  ترکیب: ['ادغام', 'merge', 'combine'],
  تقسیم: ['split', 'جدا کردن'],
  رمزگذاری: ['امنیت', 'decrypt', 'security', 'حذف رمز'],
  امنیت: ['رمزگذاری', 'decrypt', 'security', 'حذف رمز'],
  واترمارک: ['watermark', 'نشان آبی'],
  'تبدیل فرمت': ['convert', 'تغییر فرمت'],
  'حروف فارسی': ['تبدیل عدد', 'persian numbers'],
  حقوق: ['salary', 'دستمزد', 'wage'],
  سود: ['interest', 'بهره'],
  تقویم: ['calendar', 'تاریخ'],
};

export function normalizeToolSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/\u064A/g, '\u06CC') // Arabic Yeh → Persian Yeh
    .replace(/\u0643/g, '\u06A9') // Arabic Kaf → Persian Kaf
    .replace(/\s+/g, ' ')
    .trim();
}

function expandQuery(query: string): string[] {
  const normalized = normalizeToolSearchText(query);
  const terms = [normalized];

  for (const [key, values] of Object.entries(synonyms)) {
    if (normalized.includes(normalizeToolSearchText(key))) {
      terms.push(...values.map(normalizeToolSearchText));
    }
    for (const value of values) {
      if (normalized.includes(normalizeToolSearchText(value))) {
        terms.push(normalizeToolSearchText(key));
        terms.push(...values.map(normalizeToolSearchText));
      }
    }
  }

  return [...new Set(terms)];
}

function scoreMatch(tool: ToolEntry, queryTerms: string[]): number {
  const title = normalizeToolSearchText(tool.title.replace(/ - جعبه ابزار فارسی/g, ''));
  const description = normalizeToolSearchText(tool.description);
  const keywords = (tool.keywords ?? []).map(normalizeToolSearchText).join(' ');
  const category = tool.category?.name ? normalizeToolSearchText(tool.category.name) : '';

  let score = 0;

  for (const term of queryTerms) {
    if (title.includes(term)) {
      score += 10;
    }
    if (description.includes(term)) {
      score += 5;
    }
    if (keywords.includes(term)) {
      score += 8;
    }
    if (category.includes(term)) {
      score += 6;
    }
    if (title.startsWith(term)) {
      score += 3;
    }
  }

  return score;
}

export function searchTools(
  tools: ToolEntry[] = toolsRegistry,
  query: string,
  limit = 8,
): Array<ToolEntry> {
  if (query.trim().length === 0) {
    return [];
  }

  const queryTerms = expandQuery(query);
  const results: Array<{ tool: ToolEntry; score: number }> = [];

  for (const tool of tools) {
    if (tool.kind !== 'tool' && tool.kind !== 'category') {
      continue;
    }
    const score = scoreMatch(tool, queryTerms);
    if (score > 0) {
      results.push({ tool, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((result) => result.tool);
}
