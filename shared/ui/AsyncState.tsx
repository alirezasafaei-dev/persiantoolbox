import type { ReactNode } from 'react';

type AsyncStateVariant = 'loading' | 'empty' | 'error';

type AsyncStateAction = {
  label: string;
  onClick: () => void;
};

type AsyncStateProps = {
  variant: AsyncStateVariant;
  title?: string;
  description: string;
  className?: string;
  icon?: ReactNode;
  action?: AsyncStateAction;
};

const defaultTitles: Record<AsyncStateVariant, string> = {
  loading: 'در حال بارگذاری',
  empty: 'داده‌ای یافت نشد',
  error: 'خطا در دریافت اطلاعات',
};

const defaultIcons: Record<AsyncStateVariant, string> = {
  loading: '⏳',
  empty: '📭',
  error: '⚠️',
};

export default function AsyncState({
  variant,
  title,
  description,
  className,
  icon,
  action,
}: AsyncStateProps) {
  const accessibilityProps =
    variant === 'error'
      ? ({ role: 'alert', 'aria-live': 'assertive' } as const)
      : ({ role: 'status', 'aria-live': 'polite' } as const);

  return (
    <div
      className={`rounded-md border border-(--border-light) bg-(--surface-1) p-4 ${className ?? ''}`.trim()}
      {...accessibilityProps}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg leading-none" aria-hidden="true">
          {icon ?? defaultIcons[variant]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-(--text-primary)">
            {title ?? defaultTitles[variant]}
          </div>
          <div className="mt-1 text-sm text-(--text-muted)">{description}</div>
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-3 rounded-sm border border-(--border-light) bg-(--surface-0) px-3 py-1.5 text-xs font-semibold text-(--text-primary) transition-colors duration-(--motion-fast) hover:border-primary hover:text-primary"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
