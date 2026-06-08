'use client';

import { Card, ButtonLink } from '@/components/ui';
import {
  IconZap,
  IconShield,
  IconCalculator,
  IconCalendar,
  IconCode,
  IconDatabase,
} from '@/shared/ui/icons';
import JsonFormatter from './JsonFormatter';
import Base64Tool from './Base64Tool';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const installCommands = [
  {
    title: 'نصب با pnpm',
    command: 'pnpm add persian-tools',
  },
  {
    title: 'نصب با npm',
    command: 'npm install persian-tools',
  },
  {
    title: 'نصب با yarn',
    command: 'yarn add persian-tools',
  },
];

const usageSamples = [
  {
    title: 'اعداد و تبدیل‌ها',
    code: `import { parseLooseNumber, numberToWordsFa } from 'persian-tools';

const parsed = parseLooseNumber('۱۲٬۳۴۵٫۶۷');
const words = numberToWordsFa(parsed ?? 0);
console.log(parsed, words);`,
  },
  {
    title: 'تاریخ و تقویم',
    code: `import { convertDate, formatPersianDate } from 'persian-tools';

const result = convertDate({
  from: 'jalali',
  to: 'gregorian',
  date: { year: 1403, month: 1, day: 1 },
});

console.log(formatPersianDate(new Date()));
console.log(result);`,
  },
  {
    title: 'اعتبارسنجی ایرانی',
    code: `import { isValidNationalId, isValidIranianMobile } from 'persian-tools';

console.log(isValidNationalId('0010350829'));
console.log(isValidIranianMobile('09123456789'));`,
  },
  {
    title: 'محاسبات مالی',
    code: `import { calculateLoan, calculateCompoundInterest } from 'persian-tools';

const loan = calculateLoan({
  amount: 50000000,
  rate: 18,
  months: 24,
});

const compound = calculateCompoundInterest({
  principal: 100000000,
  rate: 20,
  periods: 12,
  frequency: 'monthly',
});`,
  },
];

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/auth/register',
    description: 'ثبت‌نام کاربر جدید',
    example: `{
  "email": "user@example.com",
  "password": "SecurePassword123"
}`,
  },
  {
    method: 'POST',
    endpoint: '/api/auth/login',
    description: 'ورود به سیستم',
    example: `{
  "email": "user@example.com",
  "password": "SecurePassword123"
}`,
  },
  {
    method: 'GET',
    endpoint: '/api/auth/me',
    description: 'اطلاعات کاربر جاری',
    headers: 'Authorization: Bearer {token}',
  },
  {
    method: 'POST',
    endpoint: '/api/analytics',
    description: 'ارسال رویداد analytics',
    headers: 'Content-Type: application/json',
  },
];

const highlights = [
  {
    title: 'کاملاً آفلاین',
    description: 'هیچ داده‌ای به سرور ارسال نمی‌شود و همه پردازش‌ها محلی است.',
    icon: IconShield,
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
  {
    title: 'تایپ‌سیف و سریع',
    description: 'TypeScript strict + بدون وابستگی خارجی در زمان اجرا.',
    icon: IconZap,
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
  },
  {
    title: 'کاربردهای مالی',
    description: 'محاسبات وام، حقوق، سود و تبدیل ریال/تومان.',
    icon: IconCalculator,
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
  },
  {
    title: 'تاریخ شمسی',
    description: 'تبدیل شمسی/میلادی/قمری با خروجی استاندارد.',
    icon: IconCalendar,
    tone: 'bg-[rgb(var(--color-warning-rgb)/0.12)] text-[var(--color-warning)]',
  },
  {
    title: 'API Endpointها',
    description: 'REST API کامل با احراز هویت و rate limiting.',
    icon: IconCode,
    tone: 'bg-[rgb(var(--color-purple-rgb)/0.12)] text-[var(--color-purple)]',
  },
  {
    title: 'Storage Layer',
    description: 'PostgreSQL + SQLite برای ذخیره‌سازی دائمی و کش.',
    icon: IconDatabase,
    tone: 'bg-[rgb(var(--color-orange-rgb)/0.12)] text-[var(--color-orange)]',
  },
];

export default function DevelopersPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'خانه', href: '/' },
            { label: 'راهنمای توسعه‌دهندگان', current: true },
          ]}
        />
      </div>

      <section className="section-surface p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            مرکز توسعه‌دهندگان
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            ابزارهای فارسی برای توسعه‌دهندگان
          </h1>
          <p className="text-[var(--text-secondary)]">
            از توابع آماده برای تاریخ، متن، اعتبارسنجی و محاسبات مالی در پروژه‌های وب و بک‌اند
            استفاده کنید. کتابخانه کامل با TypeScript، API endpointها و documentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/tools" size="sm">
              مشاهده همه ابزارها
            </ButtonLink>
            <ButtonLink href="/text-tools" size="sm" variant="secondary">
              ابزارهای متنی
            </ButtonLink>
            <ButtonLink href="/docs/api" size="sm" variant="secondary">
              مستندات API
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="p-5 md:p-6 flex items-start gap-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
              <div className="text-sm text-[var(--text-muted)]">{item.description}</div>
            </div>
          </Card>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="text-lg font-black text-[var(--text-primary)]">نصب کتابخانه</div>
          <p className="text-sm text-[var(--text-muted)]">
            بسته‌ی persian-tools را مستقیماً در پروژه نصب کنید و از ماژول‌ها استفاده کنید.
          </p>
          <div className="space-y-3">
            {installCommands.map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="text-xs font-semibold text-[var(--text-muted)]">{item.title}</div>
                <pre
                  dir="ltr"
                  className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-subtle)] px-4 py-3 text-xs text-[var(--text-primary)]"
                >
                  {item.command}
                </pre>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="text-lg font-black text-[var(--text-primary)]">نمونه کدها</div>
          <p className="text-sm text-[var(--text-muted)]">
            نمونه کدهای جامع برای شروع سریع در پروژه‌های واقعی.
          </p>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {usageSamples.map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <pre
                  dir="ltr"
                  className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-primary)] whitespace-pre-wrap"
                >
                  {item.code}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-3">
          <div className="text-lg font-black text-[var(--text-primary)]">دسته‌بندی ماژول‌ها</div>
          <ul className="space-y-3 text-sm text-[var(--text-muted)]">
            <li>اعداد و فرمت‌دهی: parseLooseNumber، numberToWordsFa، formatMoneyFa</li>
            <li>متن فارسی: cleanPersianText، normalizePersianChars، slugifyPersian</li>
            <li>اعتبارسنجی: کد ملی، موبایل، شبا، کارت بانکی، کدپستی</li>
            <li>مالی: محاسبه وام، حقوق، مالیات و سود مرکب</li>
            <li>تاریخ: تبدیل شمسی/میلادی/قمری، فرمت تاریخ فارسی</li>
            <li>Validation: اعتبارسنجی ایمیل، URL، phone number، national ID</li>
          </ul>
        </Card>
        <Card className="p-6 space-y-3">
          <div className="text-lg font-black text-[var(--text-primary)]">مستندات و مثال‌ها</div>
          <p className="text-sm text-[var(--text-muted)]">
            برای مشاهده جزئیات توابع، از مستندات Typedoc و مثال‌های پوشه‌ی
            <span className="font-semibold text-[var(--text-primary)]"> examples </span>
            استفاده کنید.
          </p>
          <div className="space-y-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-muted)]">
              مسیر مستندات API: docs/api
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-muted)]">
              مثال‌ها: examples/
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-muted)]">
              TypeScript types: dist/index.d.ts
            </div>
          </div>
        </Card>
      </section>

      <section className="p-6 section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <div className="text-lg font-black text-[var(--text-primary)] mb-4">API Endpointها</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)]">
                <th className="text-right py-3 px-4 font-semibold text-[var(--text-primary)]">
                  Method
                </th>
                <th className="text-right py-3 px-4 font-semibold text-[var(--text-primary)]">
                  Endpoint
                </th>
                <th className="text-right py-3 px-4 font-semibold text-[var(--text-primary)]">
                  توضیحات
                </th>
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((endpoint, index) => (
                <tr key={index} className="border-b border-[var(--border-light)] last:border-0">
                  <td className="text-right py-3 px-4">
                    <code className="bg-[var(--bg-subtle)] px-2 py-1 rounded text-xs text-[var(--color-primary)]">
                      {endpoint.method}
                    </code>
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-xs text-[var(--text-secondary)]">
                    {endpoint.endpoint}
                  </td>
                  <td className="text-right py-3 px-4 text-[var(--text-muted)]">
                    {endpoint.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <JsonFormatter />
        <Base64Tool />
      </section>
    </div>
  );
}
