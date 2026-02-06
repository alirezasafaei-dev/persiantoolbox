export type SupportLink = {
  id: 'one_time' | 'monthly' | 'sponsor';
  title: string;
  description: string;
  href: string | null;
  cta: string;
  tone: string;
};

export function getSupportLinks(): SupportLink[] {
  const oneTime = process.env['NEXT_PUBLIC_SUPPORT_ONETIME_URL'] ?? '';
  const monthly = process.env['NEXT_PUBLIC_SUPPORT_MONTHLY_URL'] ?? '';
  const sponsor = process.env['NEXT_PUBLIC_SUPPORT_SPONSOR_URL'] ?? '';

  return [
    {
      id: 'one_time',
      title: 'حمایت یک‌باره',
      description: 'کمک‌های کوچک برای پوشش هزینه‌های نگهداری و توسعه ابزارها.',
      href: oneTime.length > 0 ? oneTime : null,
      cta: 'پرداخت یک‌باره',
      tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
    },
    {
      id: 'monthly',
      title: 'حمایت ماهانه',
      description: 'کمک مستمر برای پایداری سرویس و بهبود تجربه کاربری.',
      href: monthly.length > 0 ? monthly : null,
      cta: 'اشتراک ماهانه',
      tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
    },
    {
      id: 'sponsor',
      title: 'اسپانسر سازمانی',
      description: 'همکاری رسمی با برندها برای توسعه قابلیت‌های جدید و گزارش‌دهی شفاف.',
      href: sponsor.length > 0 ? sponsor : null,
      cta: 'درخواست همکاری',
      tone: 'bg-[rgb(var(--color-warning-rgb)/0.12)] text-[var(--color-warning)]',
    },
  ];
}
