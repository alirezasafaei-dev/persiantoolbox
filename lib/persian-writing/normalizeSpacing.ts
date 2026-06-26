export function removeExtraSpaces(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function fixPunctuationSpacing(text: string): string {
  let result = text.replace(/ +([،.؟؛:!])/g, '$1');
  result = result.replace(/([،.؟؛:!])([^\s\n])/g, '$1 $2');
  result = result.replace(/([،.؟؛:!])\)/g, '$1)');
  return result;
}
