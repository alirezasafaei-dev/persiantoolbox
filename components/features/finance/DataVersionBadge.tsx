import type { FinanceDataVersion } from '@/lib/finance-data-version';

export default function DataVersionBadge({ data }: { data: FinanceDataVersion }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-secondary)]">
      نسخه داده: {data.version} | منبع: {data.source} | بروزرسانی: {data.updatedAt}
    </div>
  );
}
