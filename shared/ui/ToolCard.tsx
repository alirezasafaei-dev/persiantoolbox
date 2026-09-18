import type { ReactNode } from 'react';
import Link from 'next/link';
import { cx } from './cx';

type Props = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  meta?: string;
  prefetch?: boolean;
  className?: string;
  iconWrapClassName?: string;
};

export default function ToolCard(props: Props) {
  const iconWrapClassName = props.iconWrapClassName
    ? props.iconWrapClassName
    : 'bg-(--bg-subtle) group-hover:bg-primary/10';

  return (
    <Link
      href={props.href}
      prefetch={props.prefetch ?? false}
      data-testid="tool-card"
      className={cx(
        'block group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-primary)',
        'rounded-lg border border-(--border-light) bg-(--surface-1)/92 backdrop-blur-sm',
        'transition-all duration-(--motion-medium) hover:-translate-y-1.5 hover:shadow-strong hover:border-primary',
        props.className,
      )}
    >
      <div className="flex h-full flex-col gap-4 p-6 text-right">
        <div
          className={cx(
            'flex h-14 w-14 items-center justify-center rounded-lg transition-all duration-(--motion-medium)',
            iconWrapClassName,
          )}
        >
          <div className="transition-transform duration-(--motion-medium) group-hover:scale-110">
            {props.icon}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-bold text-(--text-primary) group-hover:text-primary transition-colors duration-(--motion-fast) wrap-break-word">
              {props.title}
            </div>
            {props.meta ? (
              <span className="rounded-full border border-(--border-light) bg-(--surface-1)/75 px-2.5 py-1 text-xs font-semibold text-(--text-muted)">
                {props.meta}
              </span>
            ) : null}
          </div>
          <div className="text-sm text-(--text-muted) leading-relaxed wrap-break-word">
            {props.description}
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-primary">
          مشاهده ابزار
          <span aria-hidden="true">←</span>
        </div>
      </div>
    </Link>
  );
}
