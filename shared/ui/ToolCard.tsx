import type { ReactNode } from 'react';
import Link from 'next/link';
import { cx } from './cx';

type Props = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  meta?: string;
  className?: string;
  iconWrapClassName?: string;
};

export default function ToolCard(props: Props) {
  return (
    <Link
      href={props.href}
      data-testid="tool-card"
      className={cx(
        'block group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
        'rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/92 backdrop-blur',
        'transition-all duration-[var(--motion-medium)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-strong)] hover:border-[var(--color-primary)]',
        props.className,
      )}
    >
      <div className="flex h-full flex-col gap-4 p-6 text-right">
        <div
          className={cx(
            'flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] transition-all duration-[var(--motion-medium)]',
            'bg-[var(--bg-subtle)] group-hover:bg-[var(--color-primary)]/10',
            props.iconWrapClassName,
          )}
        >
          <div className="transition-transform duration-[var(--motion-medium)] group-hover:scale-110">
            {props.icon}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-[var(--motion-fast)]">
              {props.title}
            </div>
            {props.meta && (
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/75 px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]">
                {props.meta}
              </span>
            )}
          </div>
          <div className="text-sm text-[var(--text-muted)] leading-relaxed">
            {props.description}
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
          مشاهده ابزار
          <span aria-hidden="true">←</span>
        </div>
      </div>
    </Link>
  );
}
