import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE_PATH = 'app/(tools)/tools/persian-ocr/page.tsx';
const OCR_PATH = 'components/features/pdf-tools/PersianOcr.tsx';
const TARGET_TITLE = 'استخراج متن از عکس آنلاین رایگان | OCR فارسی';
const TARGET_DESCRIPTION =
  'متن فارسی و انگلیسی را از عکس و تصویر آنلاین استخراج کنید. OCR فارسی رایگان در مرورگر اجرا می‌شود؛ بدون آپلود فایل به سرور و بدون ثبت‌نام.';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');
const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ');

describe('Persian OCR GSC intent contract', () => {
  it('uses concise page-specific metadata while preserving the canonical route', () => {
    const page = read(PAGE_PATH);
    const normalizedPage = normalizeWhitespace(page);

    expect(normalizedPage).toContain(`title: '${TARGET_TITLE}'`);
    expect(normalizedPage).toContain(`description: '${TARGET_DESCRIPTION}'`);
    expect(page).toContain("'استخراج متن از عکس آنلاین'");
    expect(page).toContain("'تبدیل عکس به متن'");
    expect(page).toContain('path: tool.path');
    expect(page).not.toContain('title: tool.title');
  });

  it('exposes one query-aligned H1 and keeps the local-processing promise visible', () => {
    const ocr = read(OCR_PATH);

    expect(ocr).toContain('<h1');
    expect(ocr).toContain('استخراج متن از عکس آنلاین با OCR فارسی');
    expect(ocr).toContain('بدون آپلود فایل');
    expect(ocr).not.toContain(
      '<h2 className="text-2xl font-bold text-[var(--text-primary)]">\n          استخراج متن از تصویر (OCR فارسی)\n        </h2>',
    );
  });

  it('keeps SERP metadata within the intended concise ranges', () => {
    expect(TARGET_TITLE.length).toBeLessThanOrEqual(45);
    expect(TARGET_DESCRIPTION.length).toBeGreaterThanOrEqual(90);
    expect(TARGET_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });
});
