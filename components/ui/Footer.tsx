import Link from 'next/link';

export default function Footer() {
  const portfolioUrl =
    [process.env['PORTFOLIO_URL'], process.env['NEXT_PUBLIC_PORTFOLIO_URL']]
      .map((value) => value?.trim() ?? '')
      .find((value) => value.length > 0) ?? null;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--container-max)] items-center justify-center px-4 py-3">
        {portfolioUrl ? (
          <Link
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--text-secondary)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-primary)]"
          >
            توسعه و اجرا توسط علیرضا صفایی
          </Link>
        ) : (
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            توسعه و اجرا توسط علیرضا صفایی
          </span>
        )}
      </div>
    </footer>
  );
}
