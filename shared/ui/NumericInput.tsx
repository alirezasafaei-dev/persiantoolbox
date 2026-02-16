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
  allowDecimal?: boolean;
};

function normalizeNumeric(raw: string, allowDecimal: boolean): string {
  const normalized = toEnglishDigits(raw).replace(/\s+/g, '');
  const cleaned = normalized.replace(allowDecimal ? /[^0-9,.-]/g : /[^0-9,-]/g, '');
  const noGroupingCommas = cleaned.replaceAll(',', '');
  const signFixed = noGroupingCommas.replace(/(?!^)-/g, '');

  if (!allowDecimal) {
    return signFixed;
  }

  const firstDot = signFixed.indexOf('.');
  if (firstDot < 0) {
    return signFixed;
  }

  return `${signFixed.slice(0, firstDot + 1)}${signFixed.slice(firstDot + 1).replace(/\./g, '')}`;
}

const NumericInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onValueChange, allowDecimal = true, className, error, helperText, ...rest }, ref) => {
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
        onChange={(event) => onValueChange(normalizeNumeric(event.target.value, allowDecimal))}
      />
    );
  },
);

NumericInput.displayName = 'NumericInput';

export default NumericInput;
