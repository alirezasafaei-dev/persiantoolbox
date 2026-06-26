export function normalizeZwnj(text: string): string {
  let result = text;
  result = result.replace(/می([^\s‌])/g, 'می‌$1');
  result = result.replace(/نمی([^\s‌])/g, 'نمی‌$1');
  result = result.replace(/‌‌/g, '‌');
  return result;
}
