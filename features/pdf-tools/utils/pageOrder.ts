import { toEnglishDigits } from '@/shared/utils/numbers';

export function parsePageOrder(input: string, totalPages: number): number[] {
  const normalized = toEnglishDigits(input).trim();
  if (!normalized) {
    throw new Error('لطفا ترتیب صفحات را وارد کنید.');
  }

  const pages: number[] = [];
  for (const part of normalized.split(/[,،]/)) {
    const match = /^(\d+)(?:\s*[-–—−]\s*(\d+))?$/.exec(part.trim());
    if (!match) {
      throw new Error('شماره صفحه نامعتبر است.');
    }

    const first = Number(match[1]);
    const last = Number(match[2] ?? match[1]);
    if (
      !Number.isSafeInteger(first) ||
      !Number.isSafeInteger(last) ||
      first < 1 ||
      last < 1 ||
      first > totalPages ||
      last > totalPages
    ) {
      throw new Error('شماره صفحات باید داخل محدوده فایل باشد.');
    }

    const step = first <= last ? 1 : -1;
    for (let page = first; page !== last + step; page += step) {
      pages.push(page - 1);
    }
  }
  return pages;
}
