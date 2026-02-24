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
  const baseClasses = 'btn';

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
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
