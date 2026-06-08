export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  count?: number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1em',
  count = 1,
}: SkeletonProps) {
  const baseClassName = 'skeleton';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClassName} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  ));

  return <>{skeletons}</>;
}
