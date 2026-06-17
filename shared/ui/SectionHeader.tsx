import type { ReactNode } from 'react';
import { cx } from './cx';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  id?: string;
};

export default function SectionHeader({ title, description, actions, className, id }: Props) {
  return (
    <div className={cx('space-y-1', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={id} className="text-xl font-black text-[var(--text-primary)]">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
