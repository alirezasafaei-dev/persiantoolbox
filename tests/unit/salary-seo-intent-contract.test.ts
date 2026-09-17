import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE_PATH = 'app/(tools)/salary/page.tsx';
const HUB_PATH = 'components/features/salary/SalaryHub.tsx';
const TARGET_TITLE = 'تبدیل حقوق ناخالص به خالص ۱۴۰۵ | آنلاین';
const TARGET_DESCRIPTION =
  'حقوق ناخالص را به خالص و حقوق خالص را به ناخالص تبدیل کنید. محاسبه آنلاین حقوق ۱۴۰۵ با بیمه و مالیات، همراه با جزئیات کسورات و دریافتی.';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');
const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ');

describe('salary gross/net GSC intent contract', () => {
  it('uses focused page metadata without changing the canonical salary route', () => {
    const page = read(PAGE_PATH);
    const normalizedPage = normalizeWhitespace(page);

    expect(normalizedPage).toContain(`title: '${TARGET_TITLE}'`);
    expect(normalizedPage).toContain(`description: '${TARGET_DESCRIPTION}'`);
    expect(page).toContain("'تبدیل حقوق ناخالص به خالص'");
    expect(page).toContain("'تبدیل حقوق خالص به ناخالص'");
    expect(page).toContain('path: tool.path');
    expect(page).not.toContain('title: tool.title');
  });

  it('aligns the visible H1 with the salary conversion capability', () => {
    const hub = read(HUB_PATH);

    expect(hub).toContain('محاسبه حقوق خالص و ناخالص ۱۴۰۵');
    expect(hub).toContain('تبدیل حقوق ناخالص به خالص و خالص به ناخالص');
    expect(hub).not.toContain('>\n          ابزارهای حقوق و دستمزد\n        </h1>');
  });

  it('keeps the focused metadata concise enough for the existing site title template', () => {
    expect(TARGET_TITLE.length).toBeLessThanOrEqual(45);
    expect(TARGET_DESCRIPTION.length).toBeGreaterThanOrEqual(90);
    expect(TARGET_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });
});
