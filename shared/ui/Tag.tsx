'use client';

import type { ReactNode } from 'react';

type TagProps = {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
};

const variants = {
  default: 'bg-[var(--surface-2)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
};

export default function Tag({ children, variant = 'default', size = 'sm' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
