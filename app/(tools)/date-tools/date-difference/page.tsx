import dynamic from 'next/dynamic';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const DateDifferencePage = dynamic(
  () => import('@/components/features/date-tools/DateDifference').then((module) => module.default),
  {
    loading: () => (
      <div className="flex animate-pulse flex-col gap-6">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const baseTool = getToolByPathOrThrow('/date-tools/date-difference');
const tool = {
  ...baseTool,
  title: 'محاسبه فاصله بین دو تاریخ شمسی و میلادی | تعداد روز',
  description:
    'فاصله دو تاریخ را به تعداد دقیق روز، هفته، ماه و سال تقریبی محاسبه کنید؛ با پشتیبانی از تاریخ شمسی و میلادی، رایگان و بدون ثبت‌نام.',
  keywords: [
    'محاسبه فاصله دو تاریخ',
    'تعداد روز بین دو تاریخ',
    'اختلاف تاریخ شمسی',
    'اختلاف تاریخ میلادی',
    'محاسبه روز بین دو تاریخ',
    'روز شمار آنلاین',
  ],
  lastModified: '2026-07-18',
  content: {
    intro:
      'دو تاریخ شمسی یا میلادی را وارد کنید تا فاصله دقیق آنها به روز و معادل تقریبی آن به هفته، ماه و سال محاسبه شود.',
    sections: [
      {
        heading: 'تفاوت عدد روز با ماه و سال تقریبی چیست؟',
        paragraphs: [
          'تعداد روز بر اساس فاصله واقعی دو تاریخ محاسبه می‌شود. معادل ماه و سال به دلیل تفاوت طول ماه‌ها و سال‌های کبیسه، برای مقایسه سریع به‌صورت تقریبی نمایش داده می‌شود.',
        ],
      },
    ],
    tips: [
      'ابتدا نوع تقویم شمسی یا میلادی را انتخاب کنید.',
      'برای سابقه کار و قرارداد، تاریخ شروع و پایان ثبت‌شده در سند را وارد کنید.',
      'در محاسبات رسمی، مبنای احتساب روز شروع یا پایان را با قرارداد یا مرجع مربوط تطبیق دهید.',
    ],
    faq: [
      {
        question: 'آیا ابزار از تاریخ شمسی پشتیبانی می‌کند؟',
        answer:
          'بله، می‌توانید تقویم شمسی را انتخاب کنید و هر دو تاریخ را به‌صورت سال، ماه و روز شمسی وارد کنید.',
      },
      {
        question: 'تعداد روز بین دو تاریخ دقیق است؟',
        answer:
          'بله، عدد روز از فاصله واقعی دو تاریخ به دست می‌آید. معادل ماه و سال برای نمایش ساده‌تر تقریبی است.',
      },
      {
        question: 'آیا اطلاعات تاریخ‌ها ذخیره می‌شود؟',
        answer: 'خیر، محاسبه در مرورگر انجام می‌شود و تاریخ‌های واردشده ارسال یا ذخیره نمی‌شوند.',
      },
    ],
  },
};

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default function DateDifferenceRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای تاریخ', url: `${siteUrl}/date-tools` },
          { name: 'محاسبه فاصله بین دو تاریخ' },
        ]}
      />
      <DateDifferencePage />
    </ToolPageShell>
  );
}
