'use client';

import { Card } from '@/components/ui';
import { IconShield, IconZap } from '@/shared/ui/icons';
import { BRAND } from '@/lib/brand';

const contactMethods = [
  {
    title: 'کانال تلگرام',
    description: 'آخرین اخبار و بروزرسانی‌ها را دنبال کنید.',
    href: BRAND.telegramUrl,
    icon: IconZap,
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
    external: true,
  },
  {
    title: 'ایمیل پشتیبانی',
    description: 'برای مشکلات فنی و گزارش باگ با ما تماس بگیرید.',
    href: `mailto:${BRAND.supportEmail}`,
    icon: IconShield,
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
    external: false,
  },
];

const faq = [
  {
    title: 'چگونه مشکل یا باگ گزارش کنم؟',
    items: [
      `از طریق ایمیل ${BRAND.supportEmail} مشکل را ارسال کنید.`,
      'لطفاً مرورگر و سیستم‌عامل خود را ذکر کنید.',
      'اسکرین‌شات از مشکل بسیار مفید است.',
    ],
  },
  {
    title: 'آیا امکان درخواست ابزار جدید وجود دارد؟',
    items: [
      'بله، ایده‌ها و پیشنهادات خود را از طریق ایمیل یا تلگرام ارسال کنید.',
      'درخواست‌ها بر اساس اولویت و تقاضای کاربران بررسی می‌شوند.',
    ],
  },
  {
    title: 'ابزارها رایگان هستند؟',
    items: [
      'بله، تمام ابزارهای اصلی رایگان و بدون ثبت‌نام هستند.',
      'پردازش‌ها کاملاً محلی انجام می‌شود و حریم خصوصی شما حفظ می‌شود.',
    ],
  },
  {
    title: 'آیا اطلاعات من ذخیره می‌شود؟',
    items: [
      'خیر. تمام پردازش‌ها در مرورگر شما انجام می‌شود.',
      'فایل‌ها و داده‌های شما هرگز به سرور ارسال نمی‌شوند.',
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            پشتیبانی و راهنمایی
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            چطور می‌توانیم کمک کنیم؟
          </h1>
          <p className="text-[var(--text-secondary)] leading-7 max-w-2xl">
            اگر سؤال، مشکل یا پیشنهادی دارید، از طریق راه‌های زیر با ما در ارتباط باشید. تیم
            پشتیبانی در اسرع وقت پاسخ خواهد داد.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="grid gap-4 md:grid-cols-2">
        {contactMethods.map((method) => (
          <a
            key={method.title}
            href={method.href}
            target={method.external ? '_blank' : undefined}
            rel={method.external ? 'noopener noreferrer' : undefined}
            className="group rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${method.tone}`}
              >
                <method.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {method.title}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{method.description}</div>
              </div>
            </div>
          </a>
        ))}
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سؤالات متداول</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faq.map((section) => (
            <Card key={section.title} className="p-5 space-y-3">
              <div className="text-base font-bold text-[var(--text-primary)]">{section.title}</div>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
