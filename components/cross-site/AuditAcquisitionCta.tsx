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
      className={`rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2 ${className}`}
    >
      <p className="text-sm text-[var(--text-secondary)] leading-7">{resolved.offer.title}</p>
      <p className="text-xs text-[var(--text-muted)]">{resolved.offer.subtitle}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={href}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          {resolved.offer.emoji} نمونه گزارش
        </a>
        <a
          href={auditStartHref}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          شروع ارزیابی رایگان
        </a>
      </div>
    </aside>
  );
}
