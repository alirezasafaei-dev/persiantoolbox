import { toEnglishDigits } from '@/shared/utils/numbers';

export type PersianAddressInput = {
  country: string;
  province: string;
  city: string;
  district?: string;
  street: string;
  alley?: string;
  plaqueNo: string;
  unit?: string;
  floor?: string;
  postalCode?: string;
  landmark?: string;
};

export type AddressOutputMode = 'strict-postal' | 'readable';

export type EnglishAddressOutput = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  singleLine: string;
  mode: AddressOutputMode;
};

export type ConvertPersianAddressOptions = {
  mode?: AddressOutputMode;
};

const conceptualTerms: Array<[RegExp, string]> = [
  [/خیابان/g, 'Street'],
  [/بلوار/g, 'Boulevard'],
  [/کوچه/g, 'Alley'],
  [/بن[\u200c\s-]?بست/g, 'Dead End'],
  [/میدان/g, 'Square'],
  [/چهارراه/g, 'Crossroad'],
  [/نبش/g, 'Corner of'],
  [/اتوبان/g, 'Expressway'],
  [/بزرگراه/g, 'Highway'],
  [/پل/g, 'Bridge'],
  [/جاده/g, 'Road'],
  [/پلاک/g, 'No.'],
  [/واحد/g, 'Unit'],
  [/طبقه/g, 'Floor'],
  [/محله/g, 'District'],
  [/استان/g, 'Province'],
  [/شهر/g, 'City'],
  [/شمالی/g, 'North'],
  [/جنوبی/g, 'South'],
  [/شرقی/g, 'East'],
  [/غربی/g, 'West'],
];

const phraseOverrides: Array<[RegExp, string]> = [
  [/جمهوری[\u200c\s-]?اسلامی[\u200c\s-]?ایران/g, 'Islamic Republic of Iran'],
  [/آذربایجان شرقی/g, 'East Azerbaijan'],
  [/آذربایجان غربی/g, 'West Azerbaijan'],
  [/چهارمحال[\u200c\s-]?و[\u200c\s-]?بختیاری/g, 'Chaharmahal and Bakhtiari'],
  [/سیستان[\u200c\s-]?و[\u200c\s-]?بلوچستان/g, 'Sistan and Baluchestan'],
  [/کهگیلویه[\u200c\s-]?و[\u200c\s-]?بویراحمد/g, 'Kohgiluyeh and Boyer-Ahmad'],
  [/خراسان رضوی/g, 'Razavi Khorasan'],
  [/خراسان شمالی/g, 'North Khorasan'],
  [/خراسان جنوبی/g, 'South Khorasan'],
  [/گلستان جنوبی/g, 'South Golestan'],
  [/گلستان شمالی/g, 'North Golestan'],
  [/بندر[\u200c\s-]?عباس/g, 'Bandar Abbas'],
  [/بندر[\u200c\s-]?انزلی/g, 'Bandar Anzali'],
  [/بندر[\u200c\s-]?ماهشهر/g, 'Bandar Mahshahr'],
  [/بندر[\u200c\s-]?بوشهر/g, 'Bandar Bushehr'],
  [/شاهین[\u200c\s-]?شهر/g, 'Shahin Shahr'],
  [/اسلام[\u200c\s-]?شهر/g, 'Eslamshahr'],
  [/اندیشه/g, 'Andisheh'],
  [/بهارستان/g, 'Baharestan'],
  [/خرم[\u200c\s-]?آباد/g, 'Khorramabad'],
  [/خرم[\u200c\s-]?دره/g, 'Khorramdarreh'],
  [/سبزوار/g, 'Sabzevar'],
  [/نیشابور/g, 'Neyshabur'],
  [/قائم[\u200c\s-]?شهر/g, 'Qaemshahr'],
  [/شهرکرد/g, 'Shahrekord'],
  [/یزد/g, 'Yazd'],
  [/تهران/g, 'Tehran'],
  [/اصفهان/g, 'Isfahan'],
  [/شیراز/g, 'Shiraz'],
  [/مشهد/g, 'Mashhad'],
  [/تبریز/g, 'Tabriz'],
  [/کرج/g, 'Karaj'],
  [/قم/g, 'Qom'],
  [/اهواز/g, 'Ahvaz'],
  [/رشت/g, 'Rasht'],
  [/کرمان/g, 'Kerman'],
  [/همدان/g, 'Hamedan'],
  [/اردبیل/g, 'Ardabil'],
  [/اراک/g, 'Arak'],
  [/قزوین/g, 'Qazvin'],
  [/ساری/g, 'Sari'],
  [/گرگان/g, 'Gorgan'],
  [/سنندج/g, 'Sanandaj'],
  [/کرمانشاه/g, 'Kermanshah'],
  [/زنجان/g, 'Zanjan'],
  [/زاهدان/g, 'Zahedan'],
  [/بجنورد/g, 'Bojnord'],
  [/یاسوج/g, 'Yasuj'],
  [/بوشهر/g, 'Bushehr'],
  [/ایلام/g, 'Ilam'],
  [/بیرجند/g, 'Birjand'],
  [/کاشان/g, 'Kashan'],
  [/کیش/g, 'Kish'],
  [/قشم/g, 'Qeshm'],
  [/ورامین/g, 'Varamin'],
  [/پاکدشت/g, 'Pakdasht'],
  [/پردیس/g, 'Pardis'],
  [/پرند/g, 'Parand'],
  [/شهریار/g, 'Shahriar'],
  [/ملارد/g, 'Malard'],
  [/قدس/g, 'Qods'],
  [/نجف[\u200c\s-]?آباد/g, 'Najafabad'],
  [/خمینی[\u200c\s-]?شهر/g, 'Khomeinishahr'],
  [/دزفول/g, 'Dezful'],
  [/آبادان/g, 'Abadan'],
  [/خرمشهر/g, 'Khorramshahr'],
  [/گنبد[\u200c\s-]?کاووس/g, 'Gonbad-e Kavus'],
  [/بابل/g, 'Babol'],
  [/آمل/g, 'Amol'],
  [/چالوس/g, 'Chalus'],
  [/لاهیجان/g, 'Lahijan'],
  [/انزلی/g, 'Anzali'],
  [/ارومیه/g, 'Urmia'],
  [/مهاباد/g, 'Mahabad'],
  [/مراغه/g, 'Maragheh'],
  [/مرند/g, 'Marand'],
  [/کاشمر/g, 'Kashmar'],
  [/طبس/g, 'Tabas'],
  [/نهاوند/g, 'Nahavand'],
  [/ساوه/g, 'Saveh'],
  [/شاهرود/g, 'Shahroud'],
  [/دامغان/g, 'Damghan'],
  [/دماوند/g, 'Damavand'],
  [/فیروزکوه/g, 'Firuzkuh'],
  [/فردیس/g, 'Fardis'],
  [/مجیدیه/g, 'Majidiyeh'],
  [/نیاوران/g, 'Niavaran'],
  [/زعفرانیه/g, 'Zaferanieh'],
  [/قیطریه/g, 'Qeytarieh'],
  [/سعادت[\u200c\s-]?آباد/g, 'Saadat Abad'],
  [/جنت[\u200c\s-]?آباد/g, 'Jannat Abad'],
  [/شهران/g, 'Shahran'],
  [/صادقیه/g, 'Sadeghiyeh'],
  [/ونک/g, 'Vanak'],
  [/پاسداران/g, 'Pasdaran'],
  [/بهشتی/g, 'Beheshti'],
  [/آزادی/g, 'Azadi'],
  [/انقلاب/g, 'Enqelab'],
  [/فاطمی/g, 'Fatemi'],
  [/مطهری/g, 'Motahari'],
  [/شریعتی/g, 'Shariati'],
  [/طالقانی/g, 'Taleghani'],
  [/ولی[\u200c\s-]?عصر/g, 'Valiasr'],
  [/امام[\u200c\s-]?خمینی/g, 'Imam Khomeini'],
  [/امام[\u200c\s-]?رضا/g, 'Imam Reza'],
  [/ایران/g, 'Iran'],
  [/یاس/g, 'Yas'],
];

const wordOverrides: Record<string, string> = {
  شهید: 'Shahid',
  دکتر: 'Dr',
  مهندس: 'Eng',
  حاجی: 'Haji',
  اصلی: 'Main',
  فرعی: 'Sub',
  مرکزی: 'Central',
  جنوبی: 'South',
  شمالی: 'North',
  شرقی: 'East',
  غربی: 'West',
  غرب: 'West',
  شرق: 'East',
  شمال: 'North',
  جنوب: 'South',
};

const transliterationMap: Record<string, string> = {
  آ: 'a',
  ا: 'a',
  ب: 'b',
  پ: 'p',
  ت: 't',
  ث: 's',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'z',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'gh',
  ک: 'k',
  گ: 'g',
  ل: 'l',
  م: 'm',
  ن: 'n',
  و: 'v',
  ه: 'h',
  ی: 'y',
  ئ: 'y',
  ء: 'a',
  ة: 'h',
};

function normalizeText(value: string | undefined): string {
  return toEnglishDigits(value ?? '')
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[،؛]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function transliterateWord(word: string): string {
  const match = word.match(
    /^([^A-Za-z0-9\u0600-\u06FF]*)([A-Za-z0-9\u0600-\u06FF]+)([^A-Za-z0-9\u0600-\u06FF]*)$/,
  );
  if (match) {
    const prefix = match[1] ?? '';
    const core = match[2] ?? '';
    const suffix = match[3] ?? '';
    const overridden = core ? wordOverrides[core] : undefined;
    if (overridden) {
      return `${prefix}${overridden}${suffix}`;
    }
  }

  if (/^[A-Za-z0-9.,\-/#()]+$/.test(word)) {
    return word;
  }

  const lower = word
    .split('')
    .map((char) => transliterationMap[char] ?? char)
    .join('');
  if (!lower) {
    return lower;
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function transliteratePersian(text: string): string {
  return text
    .split(' ')
    .map((segment) => transliterateWord(segment))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function convertField(value: string | undefined): string {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }
  const overridden = phraseOverrides.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    normalized,
  );
  const conceptual = conceptualTerms.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    overridden,
  );
  return transliteratePersian(conceptual);
}

function compact(parts: Array<string | undefined>): string {
  return parts
    .map((item) => item?.trim() ?? '')
    .filter(Boolean)
    .join(', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s+,/g, ', ')
    .trim();
}

function formatAddressLine1(
  mode: AddressOutputMode,
  street: string,
  alley: string,
  plaqueNo: string,
  unit: string,
  floor: string,
): string {
  if (mode === 'readable') {
    return compact([
      street,
      alley,
      plaqueNo ? `Plaque ${plaqueNo}` : '',
      unit ? `Unit ${unit}` : '',
      floor ? `Floor ${floor}` : '',
    ]);
  }

  return compact([
    street,
    alley,
    plaqueNo ? `No. ${plaqueNo}` : '',
    unit ? `Unit ${unit}` : '',
    floor ? `Floor ${floor}` : '',
  ]);
}

function formatSingleLine(
  mode: AddressOutputMode,
  addressLine1: string,
  addressLine2: string,
  city: string,
  stateProvince: string,
  country: string,
  postalCode: string,
): string {
  if (mode === 'readable') {
    return compact([
      addressLine1,
      addressLine2,
      city && stateProvince ? `${city} - ${stateProvince}` : city || stateProvince,
      postalCode ? `${country} (${postalCode})` : country,
    ]);
  }

  return compact([addressLine1, addressLine2, city, stateProvince, country, postalCode]);
}

export function convertPersianAddressToEnglish(
  input: PersianAddressInput,
  options: ConvertPersianAddressOptions = {},
): EnglishAddressOutput {
  const mode = options.mode ?? 'strict-postal';

  const street = convertField(input.street);
  const alley = convertField(input.alley);
  const district = convertField(input.district);
  const landmark = convertField(input.landmark);
  const city = convertField(input.city);
  const stateProvince = convertField(input.province);
  const country = convertField(input.country || 'Iran') || 'Iran';
  const plaqueNo = normalizeText(input.plaqueNo);
  const unit = normalizeText(input.unit);
  const floor = normalizeText(input.floor);
  const postalCode = normalizeText(input.postalCode);

  const addressLine1 = formatAddressLine1(mode, street, alley, plaqueNo, unit, floor);
  const addressLine2 = compact([district, landmark]);

  return {
    addressLine1,
    addressLine2,
    city,
    stateProvince,
    country,
    postalCode,
    singleLine: formatSingleLine(
      mode,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      country,
      postalCode,
    ),
    mode,
  };
}
