import type { HTMLAttributes, ReactNode } from 'react';
import Button from './Button';
import Card from './Card';

type Action = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
};

type Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: Action;
  titleAs?: 'h2' | 'h3';
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
  titleAs = 'h2',
  className = '',
  ...props
}: Props) {
  const TitleTag = titleAs;
  return (
    <Card
      className={`text-center py-10 px-6 border border-dashed border-[var(--border-light)] ${className}`}
      {...props}
    >
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <TitleTag className="text-lg font-semibold text-[var(--text-primary)]">{title}</TitleTag>
      {description && <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>}
      {action && (
        <div className="mt-6 flex items-center justify-center">
          <Button type="button" variant={action.variant ?? 'secondary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </Card>
  );
}
