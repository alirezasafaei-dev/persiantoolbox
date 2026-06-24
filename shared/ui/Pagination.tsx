'use client';

type PaginationProps = {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export default function Pagination({ current, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
      <span>
        نمایش {current * pageSize + 1} تا {Math.min((current + 1) * pageSize, total)} از {total}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, current - 1))}
          disabled={current === 0}
          className="rounded px-2 py-1 hover:bg-[var(--surface-2)] disabled:opacity-30"
        >
          ← قبلی
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const pageNum = current < 3 ? i : current - 3 + i;
          if (pageNum < 0 || pageNum >= totalPages) {
            return null;
          }
          return (
            <button
              type="button"
              key={pageNum}
              onClick={() => onChange(pageNum)}
              className={`rounded px-2 py-1 ${
                pageNum === current
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'hover:bg-[var(--surface-2)]'
              }`}
            >
              {pageNum + 1}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages - 1, current + 1))}
          disabled={current >= totalPages - 1}
          className="rounded px-2 py-1 hover:bg-[var(--surface-2)] disabled:opacity-30"
        >
          بعدی →
        </button>
      </div>
    </div>
  );
}
