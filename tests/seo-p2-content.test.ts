import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

describe('GSC P2 SEO and GEO content contracts', () => {
  const readSource = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

  it('provides a grounded postal-code answer block', () => {
    const tool = getToolByPathOrThrow('/validation-tools/postal-code');
    expect(tool.content?.intro).toContain('کد پستی ۱۰ رقمی');
    expect(tool.content?.faq?.map((item) => item.question)).toEqual(
      expect.arrayContaining(['آیا اعتبارسنجی کد پستی استعلام رسمی نشانی است؟']),
    );
  });

  it('keeps salary content explicit about ۱۴۰۵ and estimation limits', () => {
    const tool = getToolByPathOrThrow('/salary');
    expect(tool.description).toContain('۱۴۰۵');
    expect(tool.content?.faq?.map((item) => item.question)).toEqual(
      expect.arrayContaining(['خروجی ابزار قطعی و حقوقی است؟']),
    );
  });

  it('exposes document-studio use cases in server-rendered copy', () => {
    const source = readSource('app/business-tools/document-studio/page.tsx');
    expect(source).toContain('فاکتور فروش، پیش‌فاکتور و رسید دریافت وجه');
    expect(source).toContain('پیش‌نویس سند کسب‌وکار');
    expect(source).toContain('پردازش در مرورگر');
  });
});
