'use client';

import Link from 'next/link';
import { Card, ButtonLink } from '@/components/ui';
import {
  IconZap,
  IconShield,
  IconCode,
  IconDatabase,
  IconCalculator,
  IconCalendar,
} from '@/shared/ui/icons';
import JsonFormatter from './JsonFormatter';
import Base64Tool from './Base64Tool';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const developerProducts = [
  {
    title: 'Public REST API',
    description:
      'APIهای عمومی و بدون کلید برای داده‌های بازار، قوانین حقوق و وضعیت سرویس، همراه OpenAPI 3.1.',
    icon: IconCode,
    href: '/developers/api',
    cta: 'مشاهده مستندات API',
  },
  {
    title: 'OpenAPI Specification',
    description:
      'قرارداد ماشین‌خوان برای تولید client، import در Postman و اعتبارسنجی endpointهای عمومی.',
    icon: IconDatabase,
    href: '/openapi.json',
    cta: 'دریافت OpenAPI JSON',
  },
  {
    title: 'Source & Issues',
    description:
      'کد منبع، قراردادها، تست‌ها و مسیر رسمی گزارش اشکال یا پیشنهاد برای ابزارها و APIها.',
    icon: IconShield,
    href: 'https://github.com/alirezasafaei-dev/persiantoolbox',
    cta: 'مشاهده در GitHub',
  },
];

const capabilities = [
  {
    title: 'داده نسخه‌دار حقوق',
    description: 'ETag، Last-Modified و dataset سالانه برای محاسبات حقوق و مالیات.',
    icon: IconCalculator,
  },
  {
    title: 'تاریخ و قالب فارسی',
    description: 'توابع داخلی پروژه برای تاریخ، عدد، فرمت پول و نرمال‌سازی متن فارسی.',
    icon: IconCalendar,
  },
  {
    title: 'پردازش Local-first',
    description: 'بخش بزرگی از ابزارها بدون ارسال داده به سرور در مرورگر اجرا می‌شوند.',
    icon: IconZap,
  },
  {
    title: 'قراردادهای تست‌شده',
    description: 'تست‌های واحد و قراردادی برای schema، API، sitemap و مسیرهای اصلی.',
    icon: IconShield,
  },
];

export default function DevelopersPage() {
  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'مرکز توسعه‌دهندگان', current: true },
        ]}
      />

      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
            Developer Center
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">
            ابزارها و APIهای فارسی برای توسعه‌دهندگان
          </h1>
          <p className="max-w-3xl leading-8 text-[var(--text-secondary)]">
            از APIهای عمومی نسخه‌دار، سند OpenAPI و ابزارهای محلی تست داده استفاده کنید. فقط قابلیت‌هایی
            که در نسخه زنده قابل اجرا و قابل راستی‌آزمایی‌اند در این صفحه معرفی می‌شوند.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/developers/api" size="sm">
              مستندات API
            </ButtonLink>
            <ButtonLink href="/openapi.json" size="sm" variant="secondary">
              OpenAPI JSON
            </ButtonLink>
            <ButtonLink href="/tools" size="sm" variant="secondary">
              ابزارهای آنلاین
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">محصولات قابل استفاده</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            مسیرهای زیر به قابلیت‌های فعال و مستند نسخه فعلی متصل‌اند.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {developerProducts.map((product) => {
            const isExternal = product.href.startsWith('http');
            return (
              <Card key={product.title} className="flex h-full flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
                  <product.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">{product.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[var(--text-secondary)]">
                  {product.description}
                </p>
                <Link
                  href={product.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="mt-5 inline-flex font-bold text-[var(--color-primary)] hover:underline"
                >
                  {product.cta}
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-black text-[var(--text-primary)]">قابلیت‌های فنی پروژه</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="mb-4 h-6 w-6 text-[var(--color-primary)]" />
              <h3 className="font-black text-[var(--text-primary)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ابزارهای تست سریع داده</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            JSON را قالب‌بندی کنید یا داده Base64 را بدون ارسال محتوا به سرور تبدیل کنید.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <JsonFormatter />
          <Base64Tool />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6">
        <h2 className="text-xl font-black text-[var(--text-primary)]">SDK و بسته نصب‌پذیر</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          توابع مشترک TypeScript در سورس پروژه وجود دارند، اما تا زمانی که بسته مستقل با نسخه، manifest،
          changelog و مسیر انتشار عمومی تأیید نشده باشد، دستور نصب npm در مستندات عمومی نمایش داده
          نمی‌شود. برای استفاده فعلی، API عمومی و سورس GitHub مرجع قابل اتکا هستند.
        </p>
      </section>
    </div>
  );
}
