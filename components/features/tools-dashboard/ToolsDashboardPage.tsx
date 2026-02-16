'use client';

import ToolCard from '@/shared/ui/ToolCard';
import { IconCalculator, IconMoney } from '@/shared/ui/icons';

const financeTools = [
  {
    id: 'loan',
    title: 'محاسبه‌گر وام',
    description: 'قسط ماهانه، مجموع بازپرداخت و سود کل را در لحظه محاسبه کنید.',
    path: '/loan',
    icon: <IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
  },
  {
    id: 'salary',
    title: 'محاسبه‌گر حقوق',
    description: 'حقوق خالص، مالیات و بیمه را بر اساس ورودی‌های واقعی بررسی کنید.',
    path: '/salary',
    icon: <IconMoney className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
  {
    id: 'interest',
    title: 'محاسبه‌گر سود بانکی',
    description: 'برآورد سود ساده یا مرکب سپرده برای تصمیم‌گیری سریع مالی.',
    path: '/interest',
    icon: <IconMoney className="h-7 w-7 text-[var(--color-warning)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-warning-rgb)/0.14)]',
  },
];

const pathways = [
  {
    title: 'وام + حقوق',
    description: 'ابتدا قسط وام را محاسبه کنید و بعد اثر آن را روی بودجه ماهانه خود بسنجید.',
  },
  {
    title: 'وام + سود سپرده',
    description: 'هزینه تامین مالی را در کنار بازده سپرده مقایسه کنید تا هزینه فرصت مشخص شود.',
  },
  {
    title: 'حقوق + سود سپرده',
    description: 'با خروجی حقوق خالص، ظرفیت پس‌انداز ماهانه و سود بالقوه سپرده را تحلیل کنید.',
  },
];

export default function ToolsDashboardPage() {
  return (
    <div className="space-y-10">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
            Finance Hub
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">
            ابزارهای مالی آنلاین
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            این هاب برای مسیرهای تصمیم مالی ساخته شده است: وام، حقوق و سود بانکی را کنار هم تحلیل
            کنید، خروجی را با واحد تومان ببینید و بدون ارسال اطلاعات به سرویس خارجی سناریوهای خود را
            بررسی کنید.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-[var(--text-primary)]">مسیرهای تصمیم‌گیری</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {pathways.map((pathway) => (
            <article
              key={pathway.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-5"
            >
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{pathway.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)] leading-6">
                {pathway.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-[var(--text-primary)]">ابزارهای مالی</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {financeTools.map((tool) => (
            <ToolCard
              key={tool.id}
              href={tool.path}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              iconWrapClassName={tool.iconWrapClassName}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
