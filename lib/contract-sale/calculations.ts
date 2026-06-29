const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  return toPersianDigits(d.toLocaleDateString('fa-IR'));
}

export function numberToWords(num: string): string {
  const digits = ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

  const persianToEnglish: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  const normalized = num.replace(/[۰-۹]/g, (d) => persianToEnglish[d] ?? d);
  const clean = normalized.replace(/[^0-9]/g, '');
  if (!clean || clean === '0') {
    return 'صفر';
  }

  const parts: string[] = [];
  let remaining = clean;

  while (remaining.length > 0) {
    const chunk = remaining.slice(-3).padStart(3, '0');
    remaining = remaining.slice(0, -3);

    const h = Number(chunk[0]);
    const t = Number(chunk[1]);
    const o = Number(chunk[2]);
    const scaleIdx = parts.length;

    if (h === 0 && t === 0 && o === 0) {
      parts.unshift(''); // placeholder for scale
      continue;
    }

    const chunkWords: string[] = [];
    if (h > 0) {
      chunkWords.push(hundreds[h]!);
    }

    if (t === 1) {
      const teens = [
        'ده',
        'یازده',
        'دوازده',
        'سیزده',
        'چهارده',
        'پانزده',
        'شانزده',
        'هفده',
        'هجده',
        'نوزده',
      ];
      chunkWords.push(teens[o]!);
    } else {
      if (t > 0) {
        chunkWords.push(tens[t]!);
      }
      if (o > 0) {
        chunkWords.push(digits[o]!);
      }
    }

    const chunkStr = chunkWords.join(' و ');
    const scaleWord = scales[scaleIdx];
    const part = scaleWord ? `${chunkStr} ${scaleWord}` : chunkStr;
    parts.unshift(part);
  }

  return parts.filter(Boolean).join(' و ');
}

export function createContractId(): string {
  return `sale_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}
