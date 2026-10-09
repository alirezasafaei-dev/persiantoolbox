import { describe, expect, it } from 'vitest';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

describe('GSC P1 SEO and GEO content contracts', () => {
  it('uses the page-numbering intent in metadata and answer content', () => {
    const tool = getToolWithMetadataOverride('/pdf-tools/edit/add-page-numbers');
    expect(tool.title).toContain('شماره‌گذاری صفحات PDF آنلاین');
    expect(tool.description).toContain('شماره صفحه');
    expect(tool.content?.intro).toContain('شماره');
  });

  it('answers age-calculator intent with calendar and privacy facts', () => {
    const tool = getToolWithMetadataOverride('/date-tools/age-calculator');
    expect(tool.title).toContain('محاسبه سن دقیق');
    expect(tool.content?.intro).toContain('تاریخ تولد');
    expect(tool.content?.faq?.map((item) => item.question)).toEqual(
      expect.arrayContaining(['سن بر اساس کدام تقویم محاسبه می‌شود؟']),
    );
  });

  it('answers weekday intent without changing the canonical route', () => {
    const tool = getToolWithMetadataOverride('/date-tools/weekday-finder');
    expect(tool.path).toBe('/date-tools/weekday-finder');
    expect(tool.title).toContain('تبدیل تاریخ به روز هفته');
    expect(tool.content?.intro).toContain('روز هفته');
  });

  it('keeps invoice copy grounded in printable output and local handling', () => {
    const tool = getToolWithMetadataOverride('/tools/invoice-generator');
    expect(tool.content?.intro).toContain('فاکتور');
    expect(tool.content?.faq?.map((item) => item.question)).toEqual(
      expect.arrayContaining(['آیا اطلاعات فاکتور در سرور ذخیره می‌شود؟']),
    );
  });

  it('answers extract-pages intent with concise metadata, steps, and FAQ', () => {
    const tool = getToolByPathOrThrow('/pdf-tools/extract/extract-pages');
    expect(tool.title).toContain('استخراج صفحات PDF آنلاین');
    expect(tool.description).toContain('نرم افزار استخراج صفحات از PDF');
    expect(tool.content?.intro).toContain('صفحات مورد نیاز');
    expect(tool.content?.steps).toEqual([
      expect.stringContaining('فایل PDF'),
      expect.stringContaining('صفحات مورد نظر'),
      expect.stringContaining('دانلود'),
    ]);
    expect(tool.content?.faq?.length).toBeGreaterThan(0);
    expect(tool.content?.faq?.some((item) => item.question.includes('استخراج صفحات'))).toBe(true);
  });
});
