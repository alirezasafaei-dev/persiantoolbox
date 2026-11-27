const MAX_EDIT_FILE_BYTES = 50 * 1024 * 1024;

export function getPdfEditFileSizeError(size: number): string | null {
  if (size === 0) {
    return 'فایل PDF خالی است.';
  }
  if (size > MAX_EDIT_FILE_BYTES) {
    return 'حجم فایل PDF نباید بیشتر از ۵۰ مگابایت باشد.';
  }
  return null;
}
