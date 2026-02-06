import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { getButtonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
};

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={getButtonClasses({ variant, size, fullWidth, isLoading, className })}
      disabled={isLoading || disabled === true}
      aria-busy={isLoading ? true : undefined}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -me-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
