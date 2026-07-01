import Link from 'next/link';

const quickLinks = [
  { href: '/loan', label: 'محاسبه وام' },
  { href: '/salary', label: 'محاسبه حقوق' },
  { href: '/pdf-tools/compress/compress-pdf', label: 'فشرده PDF' },
  { href: '/business-tools/document-studio', label: 'فاکتورساز' },
  { href: '/career-tools/resume-builder', label: 'رزومه‌ساز' },
  { href: '/writing-tools/persian-writing-studio', label: 'ویرایشگر فارسی' },
];

export default function HeroQuickLinks() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="دسترسی سریع به ابزارهای پرکاربرد"
    >
      <span className="text-xs font-semibold text-[var(--text-muted)]">شروع سریع:</span>
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
