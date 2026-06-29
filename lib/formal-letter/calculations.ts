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

export function createLetterId(): string {
  return `ltr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

export function countWords(text: string): number {
  const clean = text.replace(/[\s\n]+/g, ' ').trim();
  return clean ? clean.split(' ').length : 0;
}

export function countChars(text: string): number {
  return text.replace(/\s/g, '').length;
}
