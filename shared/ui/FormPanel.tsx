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
        'rounded-lg border border-(--border-light) bg-(--surface-1) p-5 md:p-6 shadow-subtle',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-(--text-primary)">{title}</div>
          {description ? <div className="text-xs text-(--text-muted)">{description}</div> : null}
        </div>
        {actions}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
