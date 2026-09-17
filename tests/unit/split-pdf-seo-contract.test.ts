import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROUTE = '/pdf-tools/split/split-pdf';
const SEO_TITLE = 'تقسیم فایل PDF آنلاین رایگان | جعبه ابزار فارسی';
const SEO_DESCRIPTION =
  'فایل PDF را آنلاین و رایگان بر اساس صفحات دلخواه تقسیم کنید. پردازش در مرورگر انجام می‌شود؛ بدون آپلود فایل به سرور و بدون ثبت‌نام اجباری.';
const SEO_KEYWORDS = ['تقسیم PDF', 'تقسیم فایل PDF', 'تقسیم PDF آنلاین', 'تقسیم فایل PDF آنلاین'];

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('split PDF GSC intent and snippet contract', () => {
  it('aligns page metadata with the ranking queries and keeps a useful SERP snippet', () => {
    const page = readSource('app/(tools)/pdf-tools/split/split-pdf/page.tsx');

    expect(page).toContain(`title: '${SEO_TITLE}'`);
    expect(page).toContain('description:');
    expect(page).toContain(`'${SEO_DESCRIPTION}'`);
    expect(SEO_DESCRIPTION.length).toBeGreaterThanOrEqual(90);
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(160);
    for (const keyword of SEO_KEYWORDS) {
      expect(page).toContain(`'${keyword}'`);
    }
  });

  it('uses the exact GSC intent in the visible H1', () => {
    const component = readSource('features/pdf-tools/split/split-pdf.tsx');

    expect(component).toMatch(/<h1[^>]*>\s*تقسیم فایل PDF آنلاین\s*<\/h1>/);
  });

  it('keeps the canonical route unchanged and describes the real single-file local workflow', () => {
    const page = readSource('app/(tools)/pdf-tools/split/split-pdf/page.tsx');

    expect(page).toContain(`getToolByPathOrThrow('${ROUTE}')`);
    expect(page).toContain('path: tool.path');
    expect(page).not.toContain('permanentRedirect');
    expect(page).not.toContain('تقسیم فایل PDF به چند فایل جداگانه');
    expect(page).not.toContain('فایل‌های جدا شده را دانلود کنید');
    expect(page).toContain('پردازش فایل در مرورگر انجام می‌شود');
    expect(page).toContain('فایل PDF خروجی را دانلود کنید');
  });
});
