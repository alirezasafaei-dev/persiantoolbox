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
      'input w-full px-4 py-3 bg-(--surface-1) border border-(--border-medium) rounded-md text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-(--motion-fast)';
    const errorClasses = error ? 'input-error border-danger focus:ring-danger' : '';

    return (
      <div className="space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-(--text-primary) rtl-fix"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {startIcon ? (
            <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none">
              {startIcon}
            </div>
          ) : null}

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

          {endIcon ? (
            <div className="absolute inset-y-0 inset-e-0 flex items-center pe-3 pointer-events-none">
              {endIcon}
            </div>
          ) : null}

          {endAction ? (
            <div className="absolute inset-y-0 inset-e-0 flex items-center pe-2">{endAction}</div>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="text-sm text-danger rtl-fix">
            {error}
          </p>
        ) : null}

        {helperText && !error ? (
          <p id={helperId} className="text-sm text-(--text-muted) rtl-fix">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
