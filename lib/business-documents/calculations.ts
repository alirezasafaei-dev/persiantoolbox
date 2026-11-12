import type { BusinessDocumentType, BusinessLineItem, BusinessDocumentTotals } from './types';
import { AUTO_DOCUMENT_NUMBER_PREFIX } from './schemas';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function calculateTotals(
  items: BusinessLineItem[],
  discountPercent?: number,
  taxPercent?: number,
): BusinessDocumentTotals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = subtotal * ((discountPercent ?? 0) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * ((taxPercent ?? 0) / 100);
  const grandTotal = taxableAmount + taxAmount;
  return { subtotal, discountAmount, taxAmount, grandTotal };
}

function getNextDocumentNumber(type: BusinessDocumentType): number {
  if (typeof window === 'undefined') {
    return 1;
  }
  const key = `pt_doc_counter_${type}`;
  const current = parseInt(localStorage.getItem(key) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
}

export function generateDocumentNumber(type: BusinessDocumentType): string {
  const prefix = AUTO_DOCUMENT_NUMBER_PREFIX[type];
  const now = new Date();
  const year = toPersianDigits(String(now.getFullYear()));
  const seq = toPersianDigits(String(getNextDocumentNumber(type)));
  return `${prefix}-${year}-${seq}`;
}

export function toPersianDigits(num: number | string): string {
  const str = String(num);
  return str.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const withCommas = rounded.toLocaleString('en-US');
  return `${toPersianDigits(withCommas)} تومان`;
}

export function formatDate(date: Date): string {
  const y = toPersianDigits(String(date.getFullYear()));
  const m = toPersianDigits(String(date.getMonth() + 1).padStart(2, '0'));
  const d = toPersianDigits(String(date.getDate()).padStart(2, '0'));
  return `${y}/${m}/${d}`;
}

export function toJalali(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function getDocumentTitle(type: BusinessDocumentType): string {
  const titles: Record<BusinessDocumentType, string> = {
    invoice: 'فاکتور فروش',
    proforma: 'پیش‌فاکتور',
    receipt: 'رسید دریافت وجه',
  };
  return titles[type];
}
