'use client';

import type { ContractClause } from '@/lib/contract-tools/types';

type Props = {
  clauses: ContractClause[];
  optionalClauses: ContractClause[];
  selectedClauses: string[];
  onToggle: (clauseId: string) => void;
};

export default function ContractClauseSelector({
  clauses,
  optionalClauses,
  selectedClauses,
  onToggle,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">بندهای پیش‌فرض</h3>
        {clauses.map((clause) => (
          <label
            key={clause.id}
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 cursor-pointer hover:bg-[rgb(var(--color-primary-rgb)/0.03)] transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedClauses.includes(clause.id)}
              onChange={() => onToggle(clause.id)}
              disabled={clause.required}
              className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              aria-label={clause.title}
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--text-primary)]">{clause.title}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1 leading-5">{clause.text}</div>
              {clause.required && (
                <span className="text-[10px] text-[var(--color-info)] mt-1 inline-block">
                  اجباری
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {optionalClauses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">بندهای اختیاری</h3>
          {optionalClauses.map((clause) => (
            <label
              key={clause.id}
              className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 cursor-pointer hover:bg-[rgb(var(--color-primary-rgb)/0.03)] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedClauses.includes(clause.id)}
                onChange={() => onToggle(clause.id)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                aria-label={clause.title}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {clause.title}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1 leading-5">{clause.text}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
