export const addressAbbreviationTable = [
  { fa: 'خیابان', en: 'St.', description: 'Street — خیابان اصلی' },
  { fa: 'بلوار', en: 'Blvd.', description: 'Boulevard — بلوار وسیع' },
  { fa: 'میدان', en: 'Sq.', description: 'Square — میدان' },
  { fa: 'کوچه', en: 'Alley', description: 'Alley — کوچه باریک' },
  { fa: 'پلاک', en: 'No.', description: 'Number — شماره پلاک' },
  { fa: 'واحد', en: 'Unit', description: 'Unit — شماره واحد' },
  { fa: 'طبقه', en: 'Floor', description: 'Floor — طبقه ساختمان' },
  { fa: 'اتوبان', en: 'Exp.', description: 'Expressway — اتوبان' },
  { fa: 'بزرگراه', en: 'Hwy.', description: 'Highway — بزرگراه' },
  { fa: 'جاده', en: 'Rd.', description: 'Road — جاده' },
  { fa: 'بن‌بست', en: 'DE', description: 'Dead End — بن‌بست' },
  { fa: 'چهارراه', en: 'Xing', description: 'Crossroad — چهارراه' },
];

export const transliterationExamples = [
  { fa: 'ونک', en: 'Vanak', note: 'تبدیل مستقیم حروف فارسی به انگلیسی' },
  { fa: 'ولیعصر', en: 'Valiasr', note: 'ترکیب حروف + واژه‌نامه اختصاصی' },
  { fa: 'پاسداران', en: 'Pasdaran', note: 'تبدیل حرف‌به‌حرف با اولویت واژه‌نامه' },
  { fa: 'تهران', en: 'Tehran', note: 'نام شهر از واژه‌نامه استخراج می‌شود' },
];

export const transliterationVsTranslation = [
  {
    concept: 'Transliteration (نوشتاری)',
    description:
      'فقط نگارش حروف فارسی با الفبای انگلیسی بدون تغییر معنی. مثال: خیابان ولیعصر → Khiaban-e Valiasr',
  },
  {
    concept: 'Translation (ترجمه‌ای)',
    description: 'تبدیل معنایی فارسی به انگلیسی. مثال: خیابان ولیعصر → Valiasr Street',
  },
  {
    concept: 'ابزار ما',
    description:
      'ترکیبی هوشمند از هر دو روش: نام خیابان‌ها و محله‌های معروف ترجمه‌ای و بقیه transliteration است.',
  },
];

export const addressLineExamples = [
  {
    label: 'Address Line 1 (خط اول)',
    example: 'Valiasr St, Alley 23, No. 12, Unit 5',
    description: 'شماره خیابان، کوچه، پلاک و واحد',
  },
  {
    label: 'Address Line 2 (خط دوم)',
    example: 'Vanak, Near Vanak Square',
    description: 'محله و نشانه تکمیلی',
  },
];

export const commonMistakes = [
  {
    mistake: 'استفاده از حروف عربی',
    wrong: 'خـيـابـان',
    correct: 'خیابان',
    tip: 'حروف عربی مثل «ي» و «ك» به «ی» و «ک» فارسی تبدیل می‌شوند.',
  },
  {
    mistake: 'نوشتن بدون نیم‌فاصله',
    wrong: 'خیابان ولی عصر',
    correct: 'خیابان ولی‌عصر',
    tip: 'نیم‌فاصله بین «ولی» و «عصر» اهمیت دارد.',
  },
  {
    mistake: 'عدم تفکیک پلاک و واحد',
    wrong: 'خیابان ولیعصر 125',
    correct: 'خیابان ولیعصر، پلاک 125',
    tip: 'شماره پلاک باید مشخص باشد.',
  },
  {
    mistake: 'نوشتن کدپستی بدون کشور',
    wrong: '1234567890',
    correct: 'Iran, 1234567890',
    tip: 'برای ارسال بین‌المللی، کدپستی باید با نام کشور همراه باشد.',
  },
];
