import type { ReactNode } from 'react';
import { IconCalculator, IconImage, IconMoney, IconPdf } from '@/shared/ui/icons';

export type HomeToolEntry = {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  iconWrapClassName: string;
};

export const homeToolIndex: HomeToolEntry[] = [
  {
    id: 'merge-pdf',
    title: 'ادغام PDF',
    description: 'چند فایل را در یک PDF یکپارچه ترکیب کنید.',
    path: '/pdf-tools/merge/merge-pdf',
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  {
    id: 'compress-pdf',
    title: 'فشرده‌سازی PDF',
    description: 'حجم فایل‌ها را با حفظ کیفیت کاهش دهید.',
    path: '/pdf-tools/compress/compress-pdf',
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  {
    id: 'image-tools',
    title: 'ابزارهای تصویر',
    description: 'فشرده‌سازی و بهینه‌سازی تصاویر با کنترل کیفیت.',
    path: '/image-tools',
    icon: <IconImage className="h-7 w-7 text-[var(--color-info)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
  },
  {
    id: 'loan',
    title: 'محاسبه‌گر وام',
    description: 'اقساط ماهانه و سود کل را ببینید.',
    path: '/loan',
    icon: <IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
  },
  {
    id: 'salary',
    title: 'محاسبه‌گر حقوق',
    description: 'حقوق خالص، بیمه و مالیات را سریع محاسبه کنید.',
    path: '/salary',
    icon: <IconMoney className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
];
