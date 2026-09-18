import type { ReactNode, HTMLAttributes, KeyboardEvent, MouseEvent } from 'react';

type Variant = 'default' | 'clickable';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: Variant;
};

export default function Card({
  children,
  className,
  variant = 'default',
  onClick,
  ...rest
}: Props) {
  const baseClasses =
    'card bg-(--surface-1)/90 backdrop-blur-xl rounded-lg border border-(--border-light) shadow-medium hover:shadow-strong transition-all duration-(--motion-medium)';

  const variantClasses = {
    default: '',
    clickable: 'card-clickable cursor-pointer hover:bg-(--surface-2)',
  };

  const isClickable = variant === 'clickable' || typeof onClick === 'function';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event as unknown as MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className ?? ''}
      `.trim()}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
