'use client';

import { getCtaForPlacement } from '@/lib/cta-registry';

type AuditAcquisitionCtaProps = {
  placement?: 'tool-result-finance' | 'trust-page';
  utmContent?: string;
  className?: string;
};

function withUtmContent(href: string, utmContent: string): string {
  try {
    const url = new URL(href);
    url.searchParams.set('utm_content', utmContent);
    return url.toString();
  } catch {
    return href;
  }
}

export default function AuditAcquisitionCta({
  placement = 'tool-result-finance',
  utmContent = 'salary-hub',
  className = '',
}: AuditAcquisitionCtaProps) {
  const resolved = getCtaForPlacement(placement);
  if (!resolved) {
    return null;
  }

  const href = withUtmContent(resolved.href, utmContent);
  const auditStartHref = href.replace('/sample-report', '/audit');

  return (
    <aside
      className={`rounded-md border border-(--border-light) bg-(--surface-1) p-4 space-y-2 ${className}`}
    >
      <p className="text-sm text-(--text-secondary) leading-7">{resolved.offer.title}</p>
      <p className="text-xs text-(--text-muted)">{resolved.offer.subtitle}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={href}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-(--text-inverted) hover:opacity-90 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">{resolved.offer.emoji}</span> نمونه گزارش
        </a>
        <a
          href={auditStartHref}
          className="inline-flex items-center gap-1.5 rounded-md border border-(--border-light) bg-(--surface-2) px-3 py-1.5 text-xs font-semibold text-(--text-primary) hover:border-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          شروع ارزیابی رایگان
        </a>
      </div>
    </aside>
  );
}
