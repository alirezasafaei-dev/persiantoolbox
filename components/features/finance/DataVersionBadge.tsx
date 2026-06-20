import type { FinanceDataVersion } from '@/lib/finance-data-version';

export default function DataVersionBadge({ data }: { data: FinanceDataVersion }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-secondary)]">
      <span>نسخه {data.version}</span>
      <span aria-hidden="true">|</span>
      <span>
        منبع:{' '}
        {data.source === 'formula-static'
          ? 'فرمول ثابت'
          : data.source === 'api-fetched'
            ? 'API'
            : 'داده محلی'}
      </span>
      <span aria-hidden="true">|</span>
      <span>{data.updatedAt}</span>
      {data.description ? (
        <>
          <span aria-hidden="true">|</span>
          <span>{data.description}</span>
        </>
      ) : null}
    </div>
  );
}
