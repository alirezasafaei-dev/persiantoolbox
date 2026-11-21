import { describe, it, expect } from 'vitest';
import { parsePageRanges } from '@/features/pdf-tools/utils/pageRanges';
import { parsePageOrder } from '@/features/pdf-tools/utils/pageOrder';

describe('pdf utils', () => {
  describe('parsePageRanges', () => {
    it('accepts Persian separators and keeps ascending set semantics', () => {
      expect(parsePageRanges('۳–۱، ۲،۵', 5)).toEqual([0, 1, 2, 4]);
    });

    it('parses ranges and single pages', () => {
      expect(parsePageRanges('1,3-5,7', 10)).toEqual([0, 2, 3, 4, 6]);
    });

    it('deduplicates and sorts pages', () => {
      expect(parsePageRanges('5-3,3,2', 10)).toEqual([1, 2, 3, 4]);
    });

    it('supports Persian digits', () => {
      expect(parsePageRanges('۲,۴-۵', 10)).toEqual([1, 3, 4]);
    });

    it('throws on invalid input', () => {
      expect(() => parsePageRanges('', 10)).toThrow('لطفا شماره صفحات را وارد کنید.');
      expect(() => parsePageRanges('0', 10)).toThrow('شماره صفحات باید داخل محدوده فایل باشد.');
      expect(() => parsePageRanges('abc', 10)).toThrow('شماره صفحه نامعتبر است.');
    });
  });

  describe('parsePageOrder', () => {
    it('keeps reverse ranges and repeated values for order validation', () => {
      expect(parsePageOrder('۳–۱، ۲', 5)).toEqual([2, 1, 0, 1]);
    });

    it('parses ordered pages and ranges', () => {
      expect(parsePageOrder('3,1-2', 5)).toEqual([2, 0, 1]);
    });

    it('keeps reversed order for ranges', () => {
      expect(parsePageOrder('5-3', 10)).toEqual([4, 3, 2]);
    });

    it('supports Persian digits', () => {
      expect(parsePageOrder('۱,۳', 10)).toEqual([0, 2]);
    });

    it('throws on invalid input', () => {
      expect(() => parsePageOrder('', 10)).toThrow('لطفا ترتیب صفحات را وارد کنید.');
      expect(() => parsePageOrder('11', 10)).toThrow('شماره صفحات باید داخل محدوده فایل باشد.');
      expect(() => parsePageOrder('x', 10)).toThrow('شماره صفحه نامعتبر است.');
    });
  });
  it.each(['1.5', '1e1', '1-2-3', ',1', '1,', '1,,2', '1 2', '0x2'])(
    'rejects malformed page expressions %s',
    (input) => {
      expect(() => parsePageRanges(input, 20)).toThrow();
      expect(() => parsePageOrder(input, 20)).toThrow();
    },
  );
});
