const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function normalizeDigits(text: string, toPersian = true): string {
  let result = text;
  for (let i = 0; i < 10; i++) {
    const arabic = ARABIC_DIGITS[i];
    const persian = PERSIAN_DIGITS[i];
    if (arabic !== undefined && persian !== undefined) {
      result = result.replace(new RegExp(arabic, 'g'), persian);
    }
  }
  if (toPersian) {
    for (let i = 0; i < 10; i++) {
      const persian = PERSIAN_DIGITS[i];
      if (persian !== undefined) {
        result = result.replace(new RegExp(String(i), 'g'), persian);
      }
    }
  }
  return result;
}
