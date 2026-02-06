import { toEnglishDigits } from '@/shared/utils/numbers';

export function parsePageRanges(input: string, totalPages: number): number[] {
  const normalized = toEnglishDigits(input).replaceAll(' ', '');
  if (normalized.length === 0) {
    throw new Error('لطفا شماره صفحات را وارد کنید.');
  }

  const result = new Set<number>();
  const parts = normalized.split(',').filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-');
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new Error('فرمت بازه صفحات صحیح نیست.');
      }
      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        throw new Error('شماره صفحات باید داخل محدوده فایل باشد.');
      }
      const from = Math.min(start, end);
      const to = Math.max(start, end);
      for (let i = from; i <= to; i += 1) {
        result.add(i - 1);
      }
    } else {
      const page = Number(part);
      if (!Number.isFinite(page)) {
        throw new Error('شماره صفحه نامعتبر است.');
      }
      if (page < 1 || page > totalPages) {
        throw new Error('شماره صفحات باید داخل محدوده فایل باشد.');
      }
      result.add(page - 1);
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}
