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

export function createEmploymentId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

export function calculateMonthlySalary(baseSalary: string, allowances: number[]): string {
  const persianToEnglish: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  const normalized = baseSalary.replace(/[۰-۹]/g, (d) => persianToEnglish[d] ?? d);
  const base = parseInt(normalized.replace(/[^0-9]/g, ''), 10) || 0;
  const total = base + allowances.reduce((a, b) => a + b, 0);
  return total.toString();
}
