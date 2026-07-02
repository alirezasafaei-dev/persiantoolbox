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
    eyebrow: 'ابزار آنلاین فارسی رایگان · بدون ثبت‌نام و نصب',
    title: `${FREE_TOOLS_DISPLAY_COUNT_LABEL} ابزار آنلاین فارسی رایگان`,
    titleAccent: 'محاسبه، تبدیل، ساخت سند و ویرایش فایل در چند ثانیه',
    subtitle:
      `با ${FREE_TOOLS_DISPLAY_LABEL} برای محاسبه وام و حقوق، تبدیل تاریخ، ` +
      'فشرده‌سازی PDF، ساخت فاکتور و رزومه، قرارداد آماده و ویرایش متن فارسی شروع کنید. ' +
      'بدون حساب کاربری، بدون نصب برنامه و با پردازش محلی در مرورگر.',
    primaryCta: 'شروع رایگان با ابزارها',
    secondaryCtaLabel: 'مشاهده قیمت خروجی حرفه‌ای',
    trustPills: ['ابزارهای پایه رایگان', 'بدون ثبت‌نام', 'پردازش محلی'],
  };
}

export function getHomeSectionCopy() {
  const categoryCount = getCategories().length;
  const groupCount = categoryGroups.length;

  return {
    categories: {
      title: 'دسته‌بندی ابزارهای رایگان فارسی',
      subtitle: `${FREE_TOOLS_DISPLAY_LABEL} در ${toPersianNumbers(groupCount)} گروه و ${toPersianNumbers(categoryCount)} دسته تخصصی`,
      cta: 'مشاهده نقشه کامل ابزارهای رایگان',
    },
    popular: {
      title: 'محبوب‌ترین ابزارهای رایگان',
      subtitle: 'ابزارهای پرجستجوی فارسی که بدون ثبت‌نام بلافاصله قابل استفاده‌اند',
    },
    useCases: {
      title: 'رایگان از کجا شروع می‌کنید؟',
      subtitle: 'کار موردنیازتان را انتخاب کنید و مستقیم وارد ابزار رایگان مناسب شوید',
    },
    newest: {
      title: 'تازه‌ترین ابزارهای رایگان',
      subtitle: 'آخرین ابزارهایی که به جعبه ابزار فارسی اضافه شده‌اند',
    },
    howItWorks: {
      title: 'رایگان و بی‌دردسر نتیجه بگیرید',
      subtitle: 'بدون نصب، بدون ثبت‌نام و بدون ارسال فایل یا متن حساس به سرور',
    },
    flagship: {
      title: 'ابزار رایگان، خروجی حرفه‌ای در صورت نیاز',
      subtitle:
        'استفاده پایه از ابزارها رایگان است. فقط اگر خروجی بدون واترمارک، قالب حرفه‌ای یا فایل Word بخواهید می‌توانید ارتقا دهید.',
      cta: 'مقایسه پلن‌ها',
    },
    trust: {
      title: 'چرا این ابزارها رایگان و قابل اعتمادند؟',
      subtitle: 'شروع رایگان، پردازش محلی و تجربه فارسی بدون پیچیدگی',
    },
  };
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
      title: 'پردازش ۱۰۰٪ محلی',
      desc: 'فایل و متن شما از دستگاه خارج نمی‌شود؛ محاسبه و تبدیل در مرورگر انجام می‌شود.',
    },
    {
      title: 'بدون ارسال داده',
      desc: 'هیچ فایل، رزومه یا قراردادی به سرور آپلود نمی‌شود. کنترل کامل با شماست.',
    },
    {
      title: 'شروع فوری',
      desc: 'بدون ایمیل، بدون رمز عبور و بدون فرایند طولانی ثبت‌نام.',
    },
    {
      title: 'فارسی و راست‌چین',
      desc: 'رابط کاملاً فارسی با اعداد فارسی، RTL و تجربه بومی برای کاربران ایران.',
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

  return (
    'جعبه ابزار فارسی؛ مجموعه ابزار آنلاین فارسی رایگان برای محاسبه وام و حقوق، تبدیل تاریخ شمسی، PDF، تصویر، فاکتور آنلاین، رزومه‌ساز فارسی، قرارداد و ویرایش متن. ' +
    `${FREE_TOOLS_DISPLAY_LABEL} با پردازش محلی در مرورگر و بدون ثبت‌نام.`
  );
}

export function getHomeMetaTitle(toolCount = getHomeToolCount()) {
  void toolCount;

  return `${BRAND.siteName} | ${FREE_TOOLS_DISPLAY_COUNT_LABEL} ابزار آنلاین فارسی رایگان`;
}
