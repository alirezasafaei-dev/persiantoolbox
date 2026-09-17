import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

const articlePath = 'content/blog/2026-06-23-mahr-calculator-guide.md';
const pagePath = 'app/(tools)/tools/mahr-calculator/page.tsx';

describe('mahr guide and schema correctness', () => {
  it('keeps the guide evergreen and scoped to cash mahr', () => {
    const article = readSource(articlePath);

    expect(article).toContain('مهریه وجه رایج');
    expect(article).toContain('شاخص سال قبل از پرداخت');
    expect(article).toContain('/tools/mahr-calculator');
    expect(article).not.toContain('تعداد سکه × قیمت روز سکه');
    expect(article).not.toContain('اطلاعات بورس ایران');
    expect(article).not.toMatch(/^title:.*۱۴۰۵/m);
  });

  it('does not attribute a coin-price calculation rule to Article 1082', () => {
    const article = readSource(articlePath);

    expect(article).toContain('تبصره ماده ۱۰۸۲');
    expect(article).not.toContain('اگر مهریه بر اساس سکه طلا تعیین شده باشد');
    expect(article).not.toContain('مهریه بیش از **۱۱۰ سکه** = تبدیل به حبس تعزیری');
  });

  it('keeps HowTo schema aligned with explicit official-index inputs', () => {
    const page = readSource(pagePath);

    expect(page).toContain('مهریه وجه رایج');
    expect(page).toContain('شاخص سال وقوع عقد');
    expect(page).toContain('شاخص سال قبل از پرداخت');
    expect(page).not.toContain('سال ثبت ازدواج را از لیست انتخاب کنید');
    expect(page).not.toContain('سالی که مهریه در آن مطالبه می‌شود را انتخاب کنید');
  });
});
