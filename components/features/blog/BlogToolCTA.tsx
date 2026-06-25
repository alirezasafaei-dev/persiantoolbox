import Link from 'next/link';
import { getIndexableTools } from '@/lib/tools-registry';

type Props = {
  tags: string[];
  currentPath?: string;
};

export const tagToToolMap: Record<string, string[]> = {
  حقوق: ['/salary', '/tools/tax-calculator', '/tools/insurance-calculator'],
  مالی: ['/salary', '/loan', '/interest', '/tools/tax-calculator'],
  محاسبه: ['/salary', '/loan', '/interest'],
  وام: ['/loan', '/tools/loan-vs-investment', '/tools/rent-vs-buy'],
  بیمه: ['/tools/insurance-calculator', '/tools/retirement-calculator'],
  tax: ['/tools/tax-calculator', '/salary'],
  PDF: [
    '/pdf-tools/merge/merge-pdf',
    '/pdf-tools/split/split-pdf',
    '/pdf-tools/compress/compress-pdf',
  ],
  تصویر: ['/image-tools/image-format-converter', '/image-tools/resize-image'],
  OCR: ['/tools/persian-ocr'],
  رزومه: ['/text-tools/resume-builder'],
  تاریخ: ['/date-tools/shamsi-gregorian', '/date-tools/date-difference'],
  امضا: ['/text-tools/signature'],
};

export default function BlogToolCTA({ tags, currentPath }: Props) {
  const allTools = getIndexableTools();
  const matchedPaths = new Set<string>();

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const [key, paths] of Object.entries(tagToToolMap)) {
      if (lowerTag.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTag)) {
        for (const p of paths) {
          matchedPaths.add(p);
        }
      }
    }
  }

  if (matchedPaths.size === 0) {
    const fallback = allTools
      .filter((t) => t.kind === 'tool' && t.path !== currentPath)
      .slice(0, 3);
    if (fallback.length === 0) {
      return null;
    }
    return (
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">ابزارهای پیشنهادی</h2>
        <p className="text-sm text-[var(--text-muted)]">این ابزارها را امتحان کنید:</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {fallback.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-3 hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {tool.title.split(' - ')[0]}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                {tool.description}
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  const matchedTools = allTools
    .filter((t) => matchedPaths.has(t.path) && t.path !== currentPath)
    .slice(0, 4);

  if (matchedTools.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.05)] p-5 space-y-3">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">ابزار مرتبط را امتحان کنید</h2>
      <p className="text-sm text-[var(--text-muted)]">
        بر اساس موضوع این مقاله، این ابزارها مفید هستند:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {matchedTools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)] transition-colors"
          >
            <div className="flex-1">
              <div className="text-sm font-bold text-[var(--color-primary)]">
                {tool.title.split(' - ')[0]}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{tool.description}</div>
            </div>
            <span className="text-[var(--color-primary)] mt-1" aria-hidden="true">
              ←
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
