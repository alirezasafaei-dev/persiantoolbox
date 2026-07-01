import { BRAND } from '@/lib/brand';
import { categoryGroups } from '@/lib/category-catalog';
import { getCategories, getToolCountForDisplay } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export function getHomeToolCount(): number {
  return getToolCountForDisplay();
}

export function getHomeHeroCopy(toolCount = getHomeToolCount()) {
  const countLabel = toPersianNumbers(toolCount);

  return {
    eyebrow: 'ابزارهای آنلاین فارسی · پردازش ۱۰۰٪ در مرورگر',
    title: 'ابزارهای فارسی بدون شلوغی',
    titleAccent: `بیش از ${countLabel} ابزار رایگان برای کار و زندگی`,
    subtitle:
      'وام و حقوق، PDF و تصویر، قرارداد و فاکتور، رزومه و ویرایش متن — همه در مرورگر شما اجرا می‌شود و داده‌ای ارسال نمی‌شود.',
    primaryCta: `کاوش ${countLabel}+ ابزار`,
    secondaryCtaLabel: 'مشاهده قیمت خروجی حرفه‌ای',
    trustPills: ['دارای نماد اعتماد الکترونیکی', 'بدون ثبت‌نام', 'حریم خصوصی محلی'],
  };
}

export function getHomeSectionCopy() {
  const toolCount = getHomeToolCount();
  const categoryCount = getCategories().length;
  const groupCount = categoryGroups.length;

  return {
    categories: {
      title: 'از کدام دسته شروع کنیم؟',
      subtitle: `${toPersianNumbers(toolCount)} ابزار در ${toPersianNumbers(groupCount)} گروه و ${toPersianNumbers(categoryCount)} دسته تخصصی`,
      cta: 'نقشه کامل ابزارها',
    },
    popular: {
      title: 'محبوب‌ترین ابزارها',
      subtitle: 'رایج‌ترین انتخاب‌های کاربران برای شروع سریع',
    },
    newest: {
      title: 'تازه‌ترین ابزارها',
      subtitle: 'آخرین افزوده‌های جعبه ابزار فارسی',
    },
    howItWorks: {
      title: 'در سه قدم نتیجه بگیرید',
      subtitle: 'بدون نصب، بدون ثبت‌نام، بدون ارسال فایل به سرور',
    },
    flagship: {
      title: 'محصولات حرفه‌ای',
      subtitle:
        'ابزارهای پایه همیشه رایگان‌اند. برای خروجی بدون واترمارک، قالب حرفه‌ای و Word از این محصولات استفاده کنید.',
      cta: 'مقایسه پلن‌ها',
    },
    trust: {
      title: 'چرا جعبه ابزار فارسی؟',
      subtitle: 'سریع، شفاف و متمرکز بر حریم خصوصی کاربر فارسی‌زبان',
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

export function getFooterBrandCopy(toolCount = getHomeToolCount()) {
  return {
    title: BRAND.siteName,
    tagline: BRAND.tagline,
    description: `مجموعه‌ای از ${toPersianNumbers(toolCount)}+ ابزار آنلاین فارسی برای کار روزمره، با تمرکز بر سرعت، سادگی و حریم خصوصی.`,
  };
}

export function getHomeMetaDescription(toolCount = getHomeToolCount()) {
  return (
    'ابزارهای آنلاین فارسی برای وام، حقوق، PDF، OCR، فاکتور، رزومه و قرارداد. ' +
    `بیش از ${toPersianNumbers(toolCount)} ابزار رایگان با پردازش ۱۰۰٪ محلی در مرورگر — بدون ثبت‌نام.`
  );
}

export function getHomeMetaTitle(toolCount = getHomeToolCount()) {
  return `${BRAND.siteName} — بیش از ${toPersianNumbers(toolCount)} ابزار آنلاین رایگان`;
}
