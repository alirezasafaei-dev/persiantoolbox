import type { ReactNode } from 'react';
import { cx } from './cx';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function FormPanel({ title, description, actions, children, className }: Props) {
  return (
    <div
      className={cx(
        'rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 md:p-6 shadow-[var(--shadow-subtle)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{title}</div>
          {description ? (
            <div className="text-xs text-[var(--text-muted)]">{description}</div>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
