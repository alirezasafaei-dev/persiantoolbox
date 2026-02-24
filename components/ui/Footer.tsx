import {
  ASDEV_PORTFOLIO_LABEL,
  ASDEV_PORTFOLIO_URL,
  ASDEV_SIGNATURE_TEXT,
  ASDEV_TELEGRAM_LABEL,
  ASDEV_TELEGRAM_URL,
  buildAsdevNetworkLinks,
} from '@/lib/asdev-network';

export default function Footer() {
  const links = buildAsdevNetworkLinks('persiantoolbox', 'footer');

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          © {new Date().getFullYear()} PersianToolbox
        </span>
        <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-[var(--text-muted)] md:justify-end">
          <span>{ASDEV_SIGNATURE_TEXT}</span>
          <span aria-hidden>•</span>
          <a
            href={ASDEV_PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {ASDEV_PORTFOLIO_LABEL}
          </a>
          <span aria-hidden>•</span>
          <a
            href={ASDEV_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {ASDEV_TELEGRAM_LABEL}
          </a>
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
