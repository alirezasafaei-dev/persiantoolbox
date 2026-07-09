import Link from 'next/link';
import type { ToolCategory } from '@/lib/tools-registry';

type Props = {
  category: ToolCategory;
  compact?: boolean;
};

const trustMessages: Record<string, { title: string; items: string[] }> = {
  'pdf-tools': {
    title: 'پردازش محلی PDF',
    items: [
      'عملیات اصلی PDF در همین صفحه و در مرورگر شما اجرا می‌شود.',
      'فایل ابزار برای پردازش به سرور اپلیکیشن آپلود نمی‌شود.',
      'برای جزئیات رفتار شبکه و تحلیل‌گر، صفحه شفافیت فنی را ببینید.',
    ],
  },
  'image-tools': {
    title: 'پردازش محلی تصاویر',
    items: [
      'ویرایش تصویر در مرورگر انجام می‌شود.',
      'فایل تصویر برای پردازش به سرور اپلیکیشن ارسال نمی‌شود.',
      'کیفیت خروجی را خودتان تنظیم می‌کنید.',
    ],
  },
  'date-tools': {
    title: 'تبدیل تاریخ محلی',
    items: [
      'محاسبات تاریخ در مرورگر انجام می‌شود.',
      'ورودی تاریخ برای پردازش به سرور اپلیکیشن ذخیره نمی‌شود.',
      'نتیجه فوری و بدون وابستگی به API خارجی نمایش داده می‌شود.',
    ],
  },
  'text-tools': {
    title: 'پردازش متن محلی',
    items: [
      'عملیات متنی اصلی در مرورگر اجرا می‌شود.',
      'متن ورودی برای پردازش ابزار به سرور اپلیکیشن ارسال نمی‌شود.',
      'خروجی را می‌توانید کپی یا دانلود کنید.',
    ],
  },
  'finance-tools': {
    title: 'محاسبات مالی شفاف',
    items: [
      'محاسبات این ابزارها در مرورگر انجام می‌شود.',
      'نتایج مالی برای محاسبه به API شخص‌ثالث وابسته نیستند.',
      'مبالغ در رابط کاربری با واحد تومان نمایش داده می‌شوند.',
    ],
  },
  'validation-tools': {
    title: 'اعتبارسنجی محلی',
    items: [
      'اعتبارسنجی در مرورگر انجام می‌شود.',
      'داده ورودی برای پردازش ابزار به سرور اپلیکیشن ارسال نمی‌شود.',
      'نتیجه بدون تأخیر شبکه نمایش داده می‌شود.',
    ],
  },
};

export default function ToolTrustBlock({ category, compact = false }: Props) {
  const trust = trustMessages[category.id] ?? trustMessages['pdf-tools'];

  return (
    <section
      className={`rounded-[var(--radius-lg)] border border-[rgb(var(--color-success-rgb)/0.32)] bg-[rgb(var(--color-success-rgb)/0.1)] ${compact ? 'p-4' : 'p-6'} space-y-3`}
    >
      <h2 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-[var(--text-primary)]`}>
        {trust?.title}
      </h2>
      <ul className="list-disc space-y-2 ps-5 text-sm leading-6 text-[var(--text-secondary)]">
        {trust?.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-xs text-[var(--text-muted)]">
        <Link
          href="/trust"
          className="font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          شفافیت فنی و حریم خصوصی
        </Link>
      </p>
    </section>
  );
}
