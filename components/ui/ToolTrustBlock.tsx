import type { ToolCategory } from '@/lib/tools-registry';

type Props = {
  category: ToolCategory;
  compact?: boolean;
};

const trustMessages: Record<string, { title: string; items: string[] }> = {
  'pdf-tools': {
    title: 'پردازش محلی و امن',
    items: [
      'تمام عملیات PDF در مرورگر شما انجام می‌شود.',
      'فایل‌ها به هیچ سروری ارسال نمی‌شوند.',
      'پس از بستن صفحه، داده‌ها از حافظه مرورگر پاک می‌شوند.',
    ],
  },
  'image-tools': {
    title: 'پردازش محلی تصاویر',
    items: [
      'تمام عملیات تصویر در مرورگر شما انجام می‌شود.',
      'تصاویر به هیچ سروری ارسال نمی‌شوند.',
      'کیفیت خروجی قابل تنظیم و کنترل است.',
    ],
  },
  'date-tools': {
    title: 'تبدیل تاریخ دقیق',
    items: [
      'تمام محاسبات تاریخ به‌صورت محلی انجام می‌شود.',
      'الگوریتم‌ها بر اساس استانداردهای رسمی هستند.',
      'تاریخ‌های ورودی ذخیره یا ارسال نمی‌شوند.',
    ],
  },
  'text-tools': {
    title: 'پردازش متن محلی',
    items: [
      'تمام عملیات متنی در مرورگر شما انجام می‌شود.',
      'متن شما به هیچ سروری ارسال نمی‌شود.',
      'خروجی قابل کپی و دانلود است.',
    ],
  },
  'finance-tools': {
    title: 'شفافیت و اعتماد در محاسبات مالی',
    items: [
      'تمام محاسبات مالی به‌صورت محلی در مرورگر شما انجام می‌شود.',
      'هیچ اسکریپت شخص ثالث یا API خارجی برای خروجی مالی استفاده نمی‌شود.',
      'نمایش تمام مقادیر مالی در رابط کاربری با واحد تومان است.',
    ],
  },
  'validation-tools': {
    title: 'اعتبارسنجی محلی',
    items: [
      'تمام عملیات اعتبارسنجی در مرورگر شما انجام می‌شود.',
      'داده‌های ورودی به هیچ سروری ارسال نمی‌شوند.',
      'نتیجه فوری و بدون تأخیر شبکه نمایش داده می‌شود.',
    ],
  },
};

export default function ToolTrustBlock({ category, compact = false }: Props) {
  const trust = trustMessages[category.id] ?? trustMessages['pdf-tools'];

  return (
    <section
      className={`rounded-[var(--radius-lg)] border border-[rgb(var(--color-success-rgb)/0.32)] bg-[rgb(var(--color-success-rgb)/0.1)] ${compact ? 'p-4' : 'p-6'} space-y-3`}
    >
      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-[var(--text-primary)]`}>
        {trust?.title}
      </h3>
      <ul className="list-disc space-y-2 ps-5 text-sm leading-6 text-[var(--text-secondary)]">
        {trust?.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
