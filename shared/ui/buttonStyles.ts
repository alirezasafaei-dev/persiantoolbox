type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonClassOptions = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string | undefined;
};

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className,
}: ButtonClassOptions): string {
  const baseClasses =
    'btn inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-all duration-[var(--motion-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeClasses = {
    sm: 'btn-sm h-8',
    md: 'btn-md h-10',
    lg: 'btn-lg h-12',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary',
    danger: 'btn-danger',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'opacity-75 cursor-wait' : '';

  return [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClass,
    loadingClass,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export type { Variant as ButtonVariant, Size as ButtonSize };
