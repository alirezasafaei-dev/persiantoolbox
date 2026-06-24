export { formatMoneyFa } from './numbers';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function formatBytesFa(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const index = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(2)} ${BYTE_UNITS[index]}`;
}

export function formatUptimeFa(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) {
    parts.push(`${d} روز`);
  }
  if (h > 0) {
    parts.push(`${h} ساعت`);
  }
  parts.push(`${m} دقیقه`);
  return parts.join(' ');
}

const faDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateFa(date: number | string): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) {
    return 'تاریخ نامعتبر';
  }
  return faDateFormatter.format(d);
}
