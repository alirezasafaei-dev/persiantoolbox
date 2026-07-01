import Link from 'next/link';

const quickLinks = [
  { href: '/loan', label: 'محاسبه وام' },
  { href: '/salary', label: 'محاسبه حقوق' },
  { href: '/pdf-tools/compress/compress-pdf', label: 'فشرده PDF' },
  { href: '/date-tools/shamsi-gregorian', label: 'تبدیل تاریخ' },
  { href: '/validation-tools/national-id', label: 'اعتبارسنجی کد ملی' },
];

export default function HeroQuickLinks() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="دسترسی سریع به ابزارهای پرکاربرد"
    >
      <span className="text-xs text-[var(--text-muted)]">پرکاربرد:</span>
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
