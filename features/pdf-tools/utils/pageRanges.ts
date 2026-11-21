import { parsePageOrder } from './pageOrder';

export function parsePageRanges(input: string, totalPages: number): number[] {
  if (!input.trim()) {
    throw new Error('لطفا شماره صفحات را وارد کنید.');
  }

  return Array.from(new Set(parsePageOrder(input, totalPages))).sort((a, b) => a - b);
}
