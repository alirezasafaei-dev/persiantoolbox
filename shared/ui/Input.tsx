import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  endAction?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, helperText, startIcon, endIcon, endAction, className, id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? `input-${autoId}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const baseClasses =
      'input w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-[var(--motion-fast)]';
    const errorClasses = error
      ? 'input-error border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
      : '';

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-primary)] rtl-fix"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            className={`
            ${baseClasses}
            ${errorClasses}
            ${startIcon ? 'ps-10' : ''}
            ${(endIcon ?? endAction) ? 'pe-10' : ''}
            ${className ?? ''}
          `.trim()}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : helperId}
            ref={ref}
            {...rest}
          />

          {endIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
              {endIcon}
            </div>
          )}

          {endAction && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-2">{endAction}</div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-sm text-[var(--color-danger)] rtl-fix">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-sm text-[var(--text-muted)] rtl-fix">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
