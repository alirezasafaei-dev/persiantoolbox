export default function Loading() {
  return (
    <div className="min-h-[60vh] max-w-full space-y-6 overflow-x-hidden p-4 sm:p-6 animate-pulse">
      <div className="h-8 w-48 rounded-[var(--radius-md)] bg-[var(--surface-2)]" />
      <div className="h-4 w-96 rounded bg-[var(--surface-2)]" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-3"
          >
            <div className="h-6 w-3/4 rounded bg-[var(--surface-2)]" />
            <div className="h-4 w-full rounded bg-[var(--surface-2)]" />
            <div className="h-4 w-2/3 rounded bg-[var(--surface-2)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
