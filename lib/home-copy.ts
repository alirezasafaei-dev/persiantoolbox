import { BRAND } from '@/lib/brand';
import { categoryGroups } from '@/lib/category-catalog';
import {
  FREE_TOOLS_DISPLAY_COUNT_LABEL,
  FREE_TOOLS_DISPLAY_LABEL,
  getCategories,
  getToolCountForDisplay,
} from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export function getHomeToolCount(): number {
  return getToolCountForDisplay();
}

export function getHomeHeroCopy(toolCount = getHomeToolCount()) {
  void toolCount;

  return {
    eyebrow: `${FREE_TOOLS_DISPLAY_LABEL} · شروع فوری`,
    title: 'ابزارهای فارسی برای کارهای روزمره',
    titleAccent: 'سریع، شفاف، بدون نصب',
    subtitle:
      `محاسبه وام و حقوق، تبدیل تاریخ، فشرده‌سازی PDF، فاکتور، رزومه و ویرایش متن — ` +
      'بدون ثبت‌نام. بسیاری از ابزارها در خود مرورگر اجرا می‌شوند؛ جزئیات فنی در صفحه شفافیت.',
    primaryCta: 'جستجوی ابزار',
    secondaryCtaLabel: 'ابزارهای پیشنهادی',
    trustPills: ['بدون ثبت‌نام', 'پردازش محلی در بیشتر ابزارها', 'شفافیت فنی'],
  };
}

export function getHomeSectionCopy() {
  const categoryCount = getCategories().length;
  const groupCount = categoryGroups.length;

  return {
    categories: {
      title: 'همه مسیرهای ابزارهای رایگان فارسی',
      subtitle: `${FREE_TOOLS_DISPLAY_LABEL} در ${toPersianNumbers(groupCount)} گروه و ${toPersianNumbers(categoryCount)} دسته تخصصی`,
      cta: 'مشاهده نقشه کامل ابزارهای رایگان',
    },
    popular: {
      title: 'ابزارهای پیشنهادی رایگان',
      subtitle: 'مسیرهای منتخب برای شروع سریع، بدون ثبت‌نام و آماده استفاده',
    },
    useCases: {
      title: 'برای چه کاری آمده‌اید؟',
      subtitle: 'نیازتان را انتخاب کنید و مستقیم وارد ابزار رایگان مناسب شوید',
    },
    audiences: {
      title: 'مسیر پیشنهادی برای هر نوع کاربر',
      subtitle:
        'به جای گشتن در فهرست‌های طولانی، از مسیر آماده نقش خودتان شروع کنید و در چند کلیک به نتیجه برسید',
    },
    newest: {
      title: 'تازه‌ترین ابزارهای رایگان',
      subtitle: 'آخرین ابزارهایی که به جعبه ابزار فارسی اضافه شده‌اند',
    },
    howItWorks: {
      title: 'سه قدم تا نتیجه، بدون اصطکاک',
      subtitle: 'ابزار را پیدا کنید، ورودی را وارد کنید و خروجی را همان لحظه بگیرید',
    },
    flagship: {
      title: 'ابزار رایگان، خروجی حرفه‌ای در صورت نیاز',
      subtitle:
        'استفاده پایه از ابزارها رایگان است. فقط اگر خروجی بدون واترمارک، قالب حرفه‌ای یا فایل Word بخواهید می‌توانید ارتقا دهید.',
      cta: 'مقایسه پلن‌ها',
    },
    trust: {
      title: 'چرا با خیال راحت شروع می‌کنید؟',
      subtitle: 'رایگان، محلی، شفاف و ساخته‌شده برای تجربه فارسی',
    },
  };
}

export function getHomeValueProofs() {
  return [
    {
      title: 'شروع فوری، بدون حساب',
      description:
        'محاسبه، تبدیل تاریخ، PDF و سندهای روزمره را بدون ثبت‌نام یا نصب برنامه امتحان کنید.',
      badge: 'بدون مانع',
    },
    {
      title: 'حریم خصوصی قابل‌اثبات',
      description:
        'ابزارهای فایل و متن حساس تا حد ممکن محلی اجرا می‌شوند. آنچه به سرور می‌رود در صفحه شفافیت فنی آمده است.',
      badge: 'جزئیات در /trust',
    },
    {
      title: 'ارتقا فقط در صورت نیاز',
      description:
        'استفاده پایه رایگان است؛ خروجی بدون واترمارک یا قالب حرفه‌ای فقط وقتی واقعاً لازم دارید.',
      badge: 'مدل شفاف',
    },
  ];
}

export function getHomeFlagshipProducts() {
  return [
    {
      title: 'فاکتورساز و رسیدساز',
      description: 'فاکتور، پیش‌فاکتور و رسید با خروجی PDF — مناسب کسب‌وکارهای کوچک.',
      href: '/business-tools/document-studio?type=invoice',
      cta: 'ساخت فاکتور',
    },
    {
      title: 'رزومه‌ساز حرفه‌ای',
      description: 'رزومه فارسی و انگلیسی با قالب‌های آماده و پیش‌نمایش زنده.',
      href: '/career-tools/resume-builder?type=persian-resume',
      cta: 'ساخت رزومه',
    },
    {
      title: 'ویرایشگر فارسی',
      description: 'اصلاح نگارش، حروف عربی، نیم‌فاصله و آمار متن در یک ویرایشگر.',
      href: '/writing-tools/persian-writing-studio',
      cta: 'ویرایش متن',
    },
  ];
}

export function getHomeTrustCards() {
  return [
    {
      title: 'پردازش محلی در ابزارهای حساس',
      desc: 'PDF، تصویر و بسیاری از محاسبات در مرورگر اجرا می‌شوند. ادعاهای مطلق «هیچ داده‌ای هرگز» را با صفحه شفافیت چک کنید.',
    },
    {
      title: 'بدون ثبت‌نام اجباری',
      desc: 'برای شروع کار به ایمیل یا حساب نیاز ندارید؛ حساب فقط برای امکانات اختیاری است.',
    },
    {
      title: 'فارسی و راست‌چین',
      desc: 'رابط فارسی، اعداد فارسی و تجربه RTL برای استفاده روزمره در ایران.',
    },
    {
      title: 'شفافیت فنی',
      desc: 'رفتار شبکه، تحلیل‌گر و حریم خصوصی در /trust مستند شده است — نه فقط شعار.',
    },
  ];
}

export function getHomeHowItWorksSteps() {
  return [
    {
      step: '۱',
      title: 'ابزار را پیدا کنید',
      desc: 'از جستجو، دسته‌بندی یا لینک‌های سریع هیرو، ابزار مناسب را انتخاب کنید.',
    },
    {
      step: '۲',
      title: 'ورودی را وارد کنید',
      desc: 'فایل، متن یا مقادیر را در فرم وارد کنید. همه چیز در همین صفحه می‌ماند.',
    },
    {
      step: '۳',
      title: 'خروجی را بگیرید',
      desc: 'نتیجه را کپی، دانلود یا چاپ کنید. پردازش همان لحظه در مرورگر تمام می‌شود.',
    },
  ];
}

export function getHomeUseCases() {
  return [
    {
      title: 'محاسبه مالی و حقوق رایگان',
      description:
        'وام، حقوق، مالیات، سود سپرده و هزینه‌های کسب‌وکار را رایگان و سریع محاسبه کنید.',
      href: '/topics/finance-tools',
      primaryHref: '/loan',
      primaryLabel: 'محاسبه وام',
      links: [
        { href: '/salary', label: 'محاسبه حقوق' },
        { href: '/interest', label: 'سود سپرده' },
        { href: '/tools/tax-calculator', label: 'مالیات' },
      ],
    },
    {
      title: 'ساخت سند فارسی رایگان',
      description: 'فاکتور، رسید، رزومه، گواهی سابقه و قرارداد را با قالب فارسی شروع کنید.',
      href: '/business-tools',
      primaryHref: '/business-tools/document-studio',
      primaryLabel: 'فاکتورساز آنلاین',
      links: [
        { href: '/career-tools/resume-builder', label: 'رزومه‌ساز فارسی' },
        { href: '/contract-tools', label: 'قرارداد آماده' },
        { href: '/career-tools/work-certificate', label: 'گواهی سابقه' },
      ],
    },
    {
      title: 'ویرایش رایگان PDF و تصویر',
      description:
        'فشرده‌سازی، تبدیل، ادغام، استخراج صفحه و کارهای روزمره فایل را رایگان انجام دهید.',
      href: '/topics/pdf-tools',
      primaryHref: '/pdf-tools/compress/compress-pdf',
      primaryLabel: 'فشرده‌سازی PDF',
      links: [
        { href: '/pdf-tools/merge/merge-pdf', label: 'ادغام PDF' },
        { href: '/pdf-tools/extract/extract-pages', label: 'استخراج صفحات' },
        { href: '/image-tools', label: 'ابزار تصویر' },
      ],
    },
    {
      title: 'متن فارسی و تاریخ رایگان',
      description:
        'تبدیل تاریخ، اصلاح نیم‌فاصله، نرمال‌سازی حروف و آماده‌سازی متن فارسی را انجام دهید.',
      href: '/writing-tools',
      primaryHref: '/writing-tools/persian-writing-studio',
      primaryLabel: 'ویرایشگر فارسی',
      links: [
        { href: '/date-tools/shamsi-gregorian', label: 'تبدیل تاریخ شمسی' },
        { href: '/zwnj-correction', label: 'اصلاح نیم‌فاصله' },
        { href: '/text-tools/signature', label: 'امضای متنی' },
      ],
    },
  ];
}

export function getHomeAudienceTracks() {
  return [
    {
      title: 'حسابدار، مدیر مالی و منابع انسانی',
      description:
        'محاسبه حقوق، مالیات، وام، بیمه، سنوات و گزارش‌های مالی را با ابزارهای رایگان شروع کنید.',
      badge: 'مالی و اداری',
      href: '/topics/finance-tools',
      links: [
        { href: '/salary', label: 'محاسبه حقوق' },
        { href: '/loan', label: 'محاسبه وام' },
        { href: '/tools/vat-calculator', label: 'مالیات بر ارزش افزوده' },
      ],
    },
    {
      title: 'کسب‌وکار کوچک، فروشگاه و فریلنسر',
      description:
        'فاکتور، رسید، پیش‌فاکتور، قرارداد و سندهای کاری را بدون نرم‌افزار سنگین آماده کنید.',
      badge: 'سند و فروش',
      href: '/business-tools',
      links: [
        { href: '/business-tools/document-studio?type=invoice', label: 'فاکتور آنلاین' },
        { href: '/business-tools/document-studio?type=receipt', label: 'رسیدساز' },
        { href: '/contract-tools', label: 'قرارداد آماده' },
      ],
    },
    {
      title: 'کاربر فایل، PDF و تصویر',
      description:
        'فشرده‌سازی، ادغام، تبدیل و آماده‌سازی فایل‌ها را سریع و با حفظ حریم خصوصی انجام دهید.',
      badge: 'فایل و PDF',
      href: '/topics/pdf-tools',
      links: [
        { href: '/pdf-tools/compress/compress-pdf', label: 'فشرده‌سازی PDF' },
        { href: '/pdf-tools/merge/merge-pdf', label: 'ادغام PDF' },
        { href: '/image-tools/image-format-converter', label: 'تبدیل تصویر' },
      ],
    },
    {
      title: 'نویسنده، دانشجو و تولیدکننده محتوا',
      description:
        'متن فارسی، نیم‌فاصله، آمار کلمات، تبدیل تاریخ و آماده‌سازی نوشته را یک‌جا مدیریت کنید.',
      badge: 'متن و محتوا',
      href: '/writing-tools',
      links: [
        { href: '/writing-tools/persian-writing-studio', label: 'ویرایشگر فارسی' },
        { href: '/text-tools/word-counter', label: 'شمارش کلمات' },
        { href: '/date-tools/shamsi-gregorian', label: 'تبدیل تاریخ' },
      ],
    },
  ];
}

export function getHomeSearchIntents() {
  return [
    {
      label: 'محاسبه وام رایگان',
      href: '/loan',
      intent: 'قسط، سود و جدول بازپرداخت',
    },
    {
      label: 'محاسبه حقوق و بیمه',
      href: '/salary',
      intent: 'حقوق خالص، مالیات و کسورات',
    },
    {
      label: 'تبدیل تاریخ شمسی',
      href: '/date-tools/shamsi-gregorian',
      intent: 'شمسی، میلادی و قمری',
    },
    {
      label: 'فشرده‌سازی PDF آنلاین',
      href: '/pdf-tools/compress/compress-pdf',
      intent: 'کم کردن حجم فایل PDF',
    },
    {
      label: 'ادغام PDF رایگان',
      href: '/pdf-tools/merge/merge-pdf',
      intent: 'چند فایل PDF در یک فایل',
    },
    {
      label: 'فاکتور آنلاین فارسی',
      href: '/business-tools/document-studio?type=invoice',
      intent: 'فاکتور، پیش‌فاکتور و رسید',
    },
    {
      label: 'رزومه‌ساز فارسی',
      href: '/career-tools/resume-builder?type=persian-resume',
      intent: 'رزومه آماده استخدام',
    },
    {
      label: 'ویرایش متن فارسی',
      href: '/writing-tools/persian-writing-studio',
      intent: 'نیم‌فاصله، حروف و نگارش',
    },
  ];
}

export function getFooterBrandCopy(toolCount = getHomeToolCount()) {
  void toolCount;

  return {
    title: BRAND.siteName,
    tagline: BRAND.tagline,
    description: `مجموعه‌ای شامل ${FREE_TOOLS_DISPLAY_LABEL} برای کار روزمره، با تمرکز بر سرعت، سادگی و حریم خصوصی.`,
  };
}

export function getHomeMetaDescription(toolCount = getHomeToolCount()) {
  void toolCount;

  return 'ابزارهای آنلاین فارسی: وام، حقوق، تاریخ شمسی، PDF، فاکتور و رزومه. بدون ثبت‌نام؛ بسیاری از ابزارها محلی در مرورگر.';
}

export function getHomeMetaTitle(toolCount = getHomeToolCount()) {
  void toolCount;

  // Keep ~50–60 chars for SERP; brand first
  return `${BRAND.siteName} | ابزار آنلاین فارسی`;
}
