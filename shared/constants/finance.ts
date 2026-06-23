/**
 * Financial constants for PersianToolbox.ir
 * All monetary values are in TOMAN (تومان) for user-facing display.
 * 1 Toman = 10 Rial (ریال)
 */

export const TOMAN_TO_RIAL = 10;

export const INSURANCE_RATE_1405 = 0.07;

export const TAX_EXEMPTION_MONTHLY_TOMAN = 40_000_000;

export const MINIMUM_WAGE_1405 = 15_066_904;

export const OVERTIME_MULTIPLIERS = {
  regular: 1.4,
  night: 1.35,
  holiday: 2.0,
} as const;
