export default function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--container-max)] items-center justify-center px-4 py-3">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          © {new Date().getFullYear()} PersianToolbox
        </span>
      </div>
    </footer>
  );
}
