export function formatNumber(num: number): string {
  return num.toLocaleString('fa-IR');
}

export function parseNumber(text: string): number {
  const englishDigits = text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return parseFloat(englishDigits) || 0;
}

export function formatCurrency(amount: number, currency: string = 'تومان'): string {
  return `${formatNumber(amount)} ${currency}`;
}

export function formatPercentage(value: number): string {
  return `%${formatNumber(value)}`;
}

export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) {
    return `${remainingMonths} ماه`;
  }
  if (remainingMonths === 0) {
    return `${years} سال`;
  }
  return `${years} سال و ${remainingMonths} ماه`;
}
