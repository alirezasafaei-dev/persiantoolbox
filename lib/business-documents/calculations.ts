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

export function generateDocumentNumber(type: BusinessDocumentType): string {
  const prefix = AUTO_DOCUMENT_NUMBER_PREFIX[type];
  const now = new Date();
  const year = toPersianDigits(String(now.getFullYear()));
  const suffix = toPersianDigits(String(Math.floor(1000 + Math.random() * 9000)));
  return `${prefix}-${year}-${suffix}`;
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
  const gY = date.getFullYear();
  const gM = date.getMonth() + 1;
  const gD = date.getDate();

  let jY = gY - 621;

  const gy = gY;
  const gm = gM;
  const gd = gD;

  const gDJulian = Math.floor(
    (365 * (gy - 1)) / 4 +
      Math.floor((gy - 1) / 100) -
      Math.floor((gy - 1) / 400) +
      Math.floor((306 * (gm + 1)) / 10) +
      gd -
      1,
  );

  const jDJulian = gDJulian - 2299160 + 79 - 1;
  jY = Math.floor(jDJulian / 10631) * 10631 + 10631;
  const r = jDJulian - Math.floor(jDJulian / 10631) * 10631;
  jY += Math.floor((3217 * (r + 1)) / 12053);
  const r2 = r + 1 - Math.floor((12 * jY - 3717) / 4) - Math.floor((683 * (jY - 1)) / 256);
  const jM = Math.floor((153 * r2 + 2023) / 5520);
  const jD = r2 - Math.floor((12 * jM - 8) / 40) + 1;

  const jmStr = toPersianDigits(String(jM).padStart(2, '0'));
  const jdStr = toPersianDigits(String(jD).padStart(2, '0'));
  const jyStr = toPersianDigits(String(jY));

  return `${jyStr}/${jmStr}/${jdStr}`;
}

export function getDocumentTitle(type: BusinessDocumentType): string {
  const titles: Record<BusinessDocumentType, string> = {
    invoice: 'فاکتور فروش',
    proforma: 'پیش‌فاکتور',
    receipt: 'رسید دریافت وجه',
  };
  return titles[type];
}
