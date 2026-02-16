import { forwardRef, type ComponentProps } from 'react';
import Input from '@/shared/ui/Input';
import { toEnglishDigits } from '@/shared/utils/numbers';

type BaseInputProps = Omit<
  ComponentProps<typeof Input>,
  'onChange' | 'value' | 'type' | 'error' | 'helperText'
> & {
  error?: string | undefined;
  helperText?: string | undefined;
};

type Props = BaseInputProps & {
  value: string;
  onValueChange: (value: string) => void;
};

function normalizeMoney(raw: string): string {
  const normalized = toEnglishDigits(raw).replace(/\s+/g, '');
  const cleaned = normalized.replace(/[^0-9,-]/g, '').replaceAll(',', '');
  return cleaned.replace(/(?!^)-/g, '');
}

const MoneyInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onValueChange, className, error, helperText, ...rest }, ref) => {
    return (
      <Input
        {...rest}
        ref={ref}
        type="text"
        dir="ltr"
        inputMode="numeric"
        className={`ltr-num ${className ?? ''}`.trim()}
        value={value}
        {...(error ? { error } : {})}
        {...(helperText ? { helperText } : {})}
        onChange={(event) => onValueChange(normalizeMoney(event.target.value))}
      />
    );
  },
);

MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
