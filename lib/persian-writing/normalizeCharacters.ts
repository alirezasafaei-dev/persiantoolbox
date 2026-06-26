export function normalizeArabicToPersian(text: string): string {
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ؤ/g, 'و')
    .replace(/إ/g, 'ا')
    .replace(/أ/g, 'ا')
    .replace(/ة/g, 'ه');
}
