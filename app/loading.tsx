export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-light)] border-t-[var(--color-primary)]" />
        <p className="text-sm text-[var(--text-muted)]">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
