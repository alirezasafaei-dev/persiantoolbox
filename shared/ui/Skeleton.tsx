import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: 'text' | 'title' | 'card' | 'avatar';
};

export default function Skeleton({ variant = 'text', className = '', ...props }: Props) {
  const baseClasses = 'animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-subtle)]';

  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    card: 'h-32 w-full',
    avatar: 'h-10 w-10 rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
