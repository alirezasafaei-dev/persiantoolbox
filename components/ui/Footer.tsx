export default function Footer() {
  const utmSource = 'persiantoolbox';
  const links = [
    {
      label: 'پورتفولیو و راه‌های ارتباطی',
      href: `https://alirezasafaeisystems.ir/?utm_source=${utmSource}&utm_medium=cross_site&utm_campaign=asdev_network&utm_content=footer`,
    },
    {
      label: 'PersianToolbox — ابزارهای فارسی (لوکال و امن)',
      href: `https://persiantoolbox.ir/?utm_source=${utmSource}&utm_medium=cross_site&utm_campaign=asdev_network&utm_content=footer`,
    },
    {
      label: 'Audit IR — بررسی فنی و امنیتی',
      href: `https://audit.alirezasafaeisystems.ir/?utm_source=${utmSource}&utm_medium=cross_site&utm_campaign=asdev_network&utm_content=footer`,
    },
  ];
  const telegram = 'https://t.me/asdevsystems';

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          © {new Date().getFullYear()} PersianToolbox
        </span>
        <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-[var(--text-muted)] md:justify-end">
          <span>ASDEV | Alireza Safaei — علیرضا صفایی</span>
          <span aria-hidden>•</span>
          <a
            href="https://alirezasafaeisystems.ir/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Portfolio & contact: alirezasafaeisystems.ir
          </a>
          <span aria-hidden>•</span>
          <a
            href={telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Telegram: @asdevsystems
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
