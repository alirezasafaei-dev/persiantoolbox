export function normalizePunctuation(text: string): string {
  let result = text;
  result = result.replace(/,/g, '،');
  result = result.replace(/\?/g, '؟');
  result = result.replace(/;/g, '؛');
  return result;
}
