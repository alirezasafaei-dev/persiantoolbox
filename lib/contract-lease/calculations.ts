const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  return toPersianDigits(d.toLocaleDateString('fa-IR'));
}

export function createLeaseId(): string {
  return `lse_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}
