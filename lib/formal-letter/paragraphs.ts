export interface LetterParagraph {
  id: string;
  title: string;
  text: string;
  defaultEnabled: boolean;
  applicableTypes: string[];
}

export const STANDARD_PARAGRAPHS: LetterParagraph[] = [
  {
    id: 'greeting',
    title: 'سلام و احترام اولیه',
    text: 'با سلام و احترام، به استحضار می‌رساند',
    defaultEnabled: true,
    applicableTypes: [
      'request',
      'complaint',
      'inquiry',
      'introduction',
      'notification',
      'cover-letter',
    ],
  },
  {
    id: 'cooperation',
    title: 'درخواست همکاری',
    text: 'بدینوسیله از جناب‌عالی تقاضا می‌گردد دستور فرمایید نسبت به موضوع مطروحه اقدام لازم معمول گردد.',
    defaultEnabled: true,
    applicableTypes: ['request'],
  },
  {
    id: 'gratitude',
    title: 'سپاسگزاری',
    text: 'پیشاپیش از مساعدت و همکاری جناب‌عالی صمیمانه سپاسگزاریم.',
    defaultEnabled: true,
    applicableTypes: ['request', 'inquiry', 'introduction'],
  },
  {
    id: 'follow-up',
    title: 'پیگیری',
    text: 'خواهشمند است نتیجه اقدامات را به این مرکز اعلام فرمایید.',
    defaultEnabled: true,
    applicableTypes: ['request', 'inquiry', 'complaint'],
  },
  {
    id: 'enclosure-ref',
    title: 'ارجاع به پیوست',
    text: 'مدارک و مستندات مربوطه به پیوست ایفاد می‌گردد.',
    defaultEnabled: true,
    applicableTypes: ['request', 'notification', 'cover-letter'],
  },
];

export const PREMIUM_PARAGRAPHS: LetterParagraph[] = [
  {
    id: 'legal-warning',
    title: 'اخطار حقوقی',
    text: 'بدینوسیله به جناب‌عالی اخطار می‌گردد در صورت عدم اقدام لازم ظرف مهلت مقرر، این مرکز حق خود را برای پیگیری قانونی از طریق مراجع قضایی محفوظ می‌دارد.',
    defaultEnabled: false,
    applicableTypes: ['complaint', 'notification'],
  },
  {
    id: 'confidentiality',
    title: 'محرمانگی',
    text: 'این نامه حاوی اطلاعات محرمانه بوده و صرفاً برای استفاده گیرنده نامه می‌باشد. افشای مفاد این نامه بدون مجوز کتبی ممنوع می‌باشد.',
    defaultEnabled: false,
    applicableTypes: ['request', 'notification', 'introduction'],
  },
  {
    id: 'urgency',
    title: 'فوریت',
    text: 'با عنایت به حساسیت موضوع، خواهشمند است دستور فرمایید در اسرع وقت و خارج از نوبت نسبت به این موضوع اقدام گردد.',
    defaultEnabled: false,
    applicableTypes: ['request', 'complaint', 'inquiry'],
  },
  {
    id: 'appeal',
    title: 'درخواست تجدیدنظر',
    text: 'با توجه به دلایل ذکر شده، از جناب‌عالی تقاضای تجدیدنظر در تصمیم صادره را داریم. در صورت صلاحدید، فرصت ارائه توضیحات تکمیلی را جهت اتخاذ تصمیم عادلانه‌تر فراهم فرمایید.',
    defaultEnabled: false,
    applicableTypes: ['complaint'],
  },
  {
    id: 'appreciation',
    title: 'تقدیر و تشکر',
    text: 'مراتب سپاس و قدردانی خود را از زحمات و همکاری صمیمانه جناب‌عالی ابراز می‌داریم. توفیق روزافزون شما را از درگاه خداوند متعال مسئلت می‌نماییم.',
    defaultEnabled: false,
    applicableTypes: ['request', 'introduction', 'notification'],
  },
];
