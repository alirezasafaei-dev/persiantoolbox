import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

describe('child allowance basis in the benefits guide', () => {
  it('uses minimum daily wage consistently in body, FAQ and summary', () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        'content/blog/2026-07-19-salary-deductions-benefits-1405-guide-v2.md',
      ),
      'utf8',
    );
    const { data, content } = matter(source);
    const faq = (data['faq'] as { question: string; answer: string }[]).find((item) =>
      item.question.includes('حق اولاد'),
    );
    expect(faq?.answer).toContain('حداقل مزد روزانه');
    expect(content).toContain('حق اولاد ماهانه = حداقل مزد روزانه × ۳ × تعداد فرزندان واجد شرایط');
    expect(source).not.toMatch(/یک سوم حقوق پایه|حقوق پایه × ۱\/۳|۶,۶۶۶,۶۶۷/);
    expect(content).toContain('حداقل مزد روزانه × ۳ × فرزندان واجد شرایط');
  });
});
