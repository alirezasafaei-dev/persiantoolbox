import { readPageOrder } from './pageOrder';

export function parsePageRanges(input: string, totalPages: number, limit = Infinity): number[] {
  if (!input.trim()) {
    throw new Error('لطفا شماره صفحات را وارد کنید.');
  }

  const pages = new Set<number>();
  for (const page of readPageOrder(input, totalPages)) {
    pages.add(page);
    if (pages.size > limit) {
      throw new Error(`حداکثر ${limit.toLocaleString('fa-IR')} صفحه را در هر نوبت انتخاب کنید.`);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}
