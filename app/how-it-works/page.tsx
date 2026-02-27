import SiteShell from '@/components/ui/SiteShell';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'نحوه کار ابزارها - جعبه ابزار فارسی',
  description: 'توضیح نحوه کار ابزارها، پردازش محلی و شیوه استفاده از خروجی‌ها',
  path: '/how-it-works',
});

export default function HowItWorksRoute() {
  const steps = [
    {
      title: '۱. انتخاب ابزار درست',
      description:
        'اول دسته‌بندی مناسب را انتخاب کنید تا مستقیما به ابزار تخصصی مرتبط برسید و زمان جست‌وجو کم شود.',
    },
    {
      title: '۲. ورود داده دقیق',
      description:
        'ورودی را با فرمت صحیح (عدد، تاریخ، متن یا فایل) وارد کنید. کیفیت ورودی، کیفیت خروجی را تعیین می‌کند.',
    },
    {
      title: '۳. پردازش فوری در مرورگر',
      description:
        'ابزارها بلافاصله عملیات را اجرا می‌کنند و نتیجه در همان صفحه نمایش داده می‌شود، بدون فرایند پیچیده.',
    },
    {
      title: '۴. بررسی و استفاده از خروجی',
      description:
        'خروجی را بازبینی کنید و سپس کپی، دانلود یا برای مرحله بعدی کار خود استفاده کنید.',
    },
  ];

  const qualityChecklist = [
    'قبل از اجرای ابزار، ورودی را یک‌بار مرور کنید.',
    'برای محاسبات مالی، واحد مبلغ و نرخ را دقیق مشخص کنید.',
    'برای ابزارهای تاریخ، تقویم درست (شمسی/میلادی/قمری) را انتخاب کنید.',
    'برای فایل‌های PDF یا تصویر، نسخه خوانا و کم‌خطا بارگذاری کنید.',
  ];

  const toolRoutes = [
    { label: 'ابزارهای PDF', href: '/pdf-tools' },
    { label: 'ابزارهای تصویر', href: '/image-tools' },
    { label: 'ابزارهای تاریخ', href: '/date-tools' },
    { label: 'ابزارهای متنی', href: '/text-tools' },
    { label: 'ابزارهای مالی', href: '/tools' },
    { label: 'ابزارهای تخصصی', href: '/tools/specialized' },
  ];

  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">نحوه کار ابزارها</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          جعبه ابزار فارسی برای یک مسیر ساده و قابل اعتماد طراحی شده است: انتخاب ابزار، ورود دقیق
          داده، پردازش سریع و تحویل خروجی قابل استفاده.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">فرآیند کاری مرحله‌به‌مرحله</h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <li
              key={step.title}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7"
            >
              <span className="font-semibold text-[var(--text-primary)]">{step.title}</span>
              <p className="mt-2">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">چک‌لیست کیفیت خروجی</h2>
        <ul className="space-y-2 text-sm leading-7 text-[var(--text-secondary)]">
          {qualityChecklist.map((item) => (
            <li
              key={item}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">از کجا شروع کنم؟</h2>
        <p className="text-sm leading-7 text-[var(--text-secondary)]">
          اگر هنوز مطمئن نیستید کدام ابزار مناسب شماست، از دسته‌بندی‌ها شروع کنید یا مستقیم وارد
          لیست ابزارهای تخصصی شوید.
        </p>
        <div className="flex flex-wrap gap-2">
          {toolRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)]"
            >
              {route.label}
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
