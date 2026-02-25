import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { getButtonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, 'className'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export default function ButtonLink({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  prefetch,
  ...rest
}: Props) {
  return (
    <Link
      prefetch={prefetch ?? false}
      className={getButtonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </Link>
  );
}
