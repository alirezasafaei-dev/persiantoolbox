import { formatNumberFa } from '@/shared/utils/numbers';

const BYTE_UNITS = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'] as const;

export function formatBytesFa(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '۰ بایت';
  }

  const index = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  const unit = BYTE_UNITS[index] ?? 'بایت';

  return `${formatNumberFa(value)} ${unit}`;
}

export function formatPercentFa(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) {
    return '۰٪';
  }

  const formatted = new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);

  return `${formatted}٪`;
}
