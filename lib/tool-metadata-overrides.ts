import type { ToolEntry } from './tools-registry';
import { getToolByPathOrThrow } from './tools-registry';

type ToolMetadataOverride = Pick<ToolEntry, 'title' | 'description' | 'keywords'>;

export const TOOL_METADATA_OVERRIDES = {
  '/date-tools/date-difference': {
    title: 'محاسبه فاصله بین دو تاریخ | تعداد روز بین دو تاریخ',
    description:
      'تعداد روز بین دو تاریخ شمسی یا میلادی را دقیق محاسبه کنید و فاصله را به روز، هفته، ماه و سال ببینید؛ رایگان و بدون ثبت‌نام.',
    keywords: [
      'محاسبه فاصله دو تاریخ',
      'فاصله بین دو تاریخ',
      'تعداد روز بین دو تاریخ',
      'اختلاف تاریخ شمسی',
      'اختلاف تاریخ میلادی',
      'محاسبه روز بین دو تاریخ',
      'روز شمار آنلاین',
    ],
  },
  '/date-tools/age-calculator': {
    title: 'محاسبه سن دقیق آنلاین | سن بر اساس تاریخ تولد',
    description:
      'سن دقیق را بر اساس تاریخ تولد شمسی یا میلادی به سال، ماه و روز محاسبه کنید؛ آنلاین، رایگان و بدون ثبت‌نام.',
    keywords: ['محاسبه سن', 'محاسبه سن دقیق', 'سن من', 'تاریخ تولد', 'چند سالمه'],
  },
  '/tools/check-penalty': {
    title: 'محاسبه تأخیر تأدیه رایگان | خسارت چک به نرخ روز',
    description:
      'خسارت تأخیر تأدیه چک را بر اساس شاخص CPI بانک مرکزی و به نرخ روز محاسبه کنید؛ محاسبه آنلاین و رایگان برای برآورد مبلغ تأخیر تأدیه.',
    keywords: [
      'محاسبه تاخیر تادیه رایگان',
      'خسارت تأخیر تأدیه',
      'محاسبه خسارت تأخیر تأدیه چک',
      'جریمه چک برگشتی',
      'CPI بانک مرکزی',
    ],
  },
  '/career-tools/work-certificate': {
    title: 'ساخت گواهی اشتغال به کار PDF | گواهی سابقه کار آنلاین',
    description:
      'گواهی اشتغال به کار و گواهی سابقه کار را آنلاین بسازید و خروجی PDF و Word بگیرید؛ مناسب ارائه به بانک، ویزا، ادارات و شرکت‌ها.',
    keywords: [
      'گواهی اشتغال به کار pdf',
      'گواهی سابقه کار',
      'گواهی اشتغال به کار',
      'ساخت گواهی سابقه کار',
      'گواهی اشتغال آنلاین',
    ],
  },
  '/validation-tools/national-id': {
    title: 'اعتبارسنجی کد ملی رایگان | بررسی صحت کد ملی آنلاین',
    description:
      'بررسی صحت کد ملی ۱۰ رقمی ایران به‌صورت آنلاین و رایگان با الگوریتم استاندارد اعتبارسنجی؛ نتیجه معتبر یا نامعتبر را فوری مشاهده کنید.',
    keywords: ['اعتبارسنجی کد ملی', 'صحت کد ملی', 'بررسی صحت کد ملی', 'کد ملی', 'اعتبار کد ملی'],
  },
  '/tools/invoice-generator': {
    title: 'ساخت فاکتور آنلاین رایگان | فاکتورساز و صورتحساب',
    description:
      'فاکتور آنلاین رایگان بسازید، اقلام و اطلاعات فروشنده را وارد کنید و خروجی PDF قابل چاپ بگیرید؛ مناسب فاکتور، صورتحساب و رسید پرداخت.',
    keywords: [
      'ساخت فاکتور آنلاین رایگان',
      'فاکتورساز',
      'فاکتور آنلاین',
      'صورتحساب',
      'رسید پرداخت',
    ],
  },
} satisfies Record<string, ToolMetadataOverride>;

export function getToolWithMetadataOverride(path: keyof typeof TOOL_METADATA_OVERRIDES): ToolEntry {
  const tool = getToolByPathOrThrow(path);
  return {
    ...tool,
    ...TOOL_METADATA_OVERRIDES[path],
    lastModified: '2026-09-11',
  };
}
