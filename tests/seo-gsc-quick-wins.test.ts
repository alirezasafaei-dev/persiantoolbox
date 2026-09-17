import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

type MetadataExpectation = {
  path:
    | '/date-tools/date-difference'
    | '/date-tools/age-calculator'
    | '/tools/check-penalty'
    | '/career-tools/work-certificate'
    | '/validation-tools/national-id'
    | '/tools/invoice-generator';
  title: string;
  descriptionTerms: string[];
  keywordTerms: string[];
};

const targets: MetadataExpectation[] = [
  {
    path: '/date-tools/date-difference',
    title: 'محاسبه فاصله بین دو تاریخ | تعداد روز بین دو تاریخ',
    descriptionTerms: ['شمسی', 'میلادی', 'رایگان', 'روز'],
    keywordTerms: ['فاصله بین دو تاریخ', 'تعداد روز بین دو تاریخ'],
  },
  {
    path: '/date-tools/age-calculator',
    title: 'محاسبه سن دقیق آنلاین | سن بر اساس تاریخ تولد',
    descriptionTerms: ['تاریخ تولد', 'شمسی', 'میلادی', 'رایگان'],
    keywordTerms: ['محاسبه سن', 'محاسبه سن دقیق'],
  },
  {
    path: '/tools/check-penalty',
    title: 'محاسبه تأخیر تأدیه رایگان | خسارت چک به نرخ روز',
    descriptionTerms: ['تأخیر تأدیه', 'CPI', 'بانک مرکزی', 'رایگان'],
    keywordTerms: ['محاسبه تاخیر تادیه رایگان', 'خسارت تأخیر تأدیه'],
  },
  {
    path: '/career-tools/work-certificate',
    title: 'ساخت گواهی اشتغال به کار PDF | گواهی سابقه کار آنلاین',
    descriptionTerms: ['PDF', 'گواهی اشتغال به کار', 'گواهی سابقه کار', 'آنلاین'],
    keywordTerms: ['گواهی اشتغال به کار pdf', 'گواهی سابقه کار'],
  },
  {
    path: '/validation-tools/national-id',
    title: 'اعتبارسنجی کد ملی رایگان | بررسی صحت کد ملی آنلاین',
    descriptionTerms: ['بررسی صحت کد ملی', '۱۰ رقمی', 'رایگان', 'آنلاین'],
    keywordTerms: ['صحت کد ملی', 'بررسی صحت کد ملی'],
  },
  {
    path: '/tools/invoice-generator',
    title: 'ساخت فاکتور آنلاین رایگان | فاکتورساز و صورتحساب',
    descriptionTerms: ['فاکتور آنلاین', 'رایگان', 'PDF', 'چاپ'],
    keywordTerms: ['ساخت فاکتور آنلاین رایگان', 'فاکتورساز'],
  },
];

describe('GSC metadata quick wins', () => {
  for (const target of targets) {
    it(`aligns ${target.path} with its proven Search Console intent`, () => {
      const tool = getToolWithMetadataOverride(target.path);

      expect(tool.title).toBe(target.title);
      for (const term of target.descriptionTerms) {
        expect(tool.description).toContain(term);
      }
      for (const term of target.keywordTerms) {
        expect(tool.keywords).toContain(term);
      }
    });
  }

  it('separates the late-payment guide informational intent from the calculator intent', () => {
    const article = fs.readFileSync(
      path.join(
        process.cwd(),
        'content/blog/2026-07-08-late-payment-damages-cheque-promissory-note-guide.md',
      ),
      'utf8',
    );

    expect(article).toContain("title: 'راهنمای خسارت تأخیر تأدیه چک و سفته | فرمول و نکات حقوقی'");
    expect(article).toContain(
      "description: 'راهنمای آموزشی خسارت تأخیر تأدیه چک و سفته؛ آشنایی با مبنا، فرمول عمومی، مثال‌ها و نکات حقوقی پیش از استفاده از ابزار محاسبه.'",
    );
    expect(article).toContain('# راهنمای خسارت تأخیر تأدیه چک و سفته؛ فرمول و نکات حقوقی');
    expect(article).toContain('[محاسبه تأخیر تأدیه رایگان](/tools/check-penalty)');
  });

  it('redirects the indexed legacy OCR article URL to the current article URL', () => {
    const nextConfig = fs.readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8');

    expect(nextConfig).toContain("source: '/blog/2026-06-26-ocr-persian-guide'");
    expect(nextConfig).toContain("destination: '/blog/2026-06-19-ocr-persian-guide'");
  });
});
