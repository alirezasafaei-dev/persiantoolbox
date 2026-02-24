import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'خدمات - جعبه ابزار فارسی',
  description: 'خدمات توسعه، بومی‌سازی و سخت‌سازی محصول دیجیتال بر پایه رویکرد local-first',
  path: '/services',
});

const serviceItems = [
  {
    title: 'پیاده‌سازی ابزارهای سفارشی',
    detail: 'توسعه ابزارهای اختصاصی فارسی با تمرکز بر عملکرد بالا و پردازش محلی.',
  },
  {
    title: 'بهینه‌سازی و پایداری محصول',
    detail: 'بهبود کیفیت کد، تست‌پذیری و استانداردسازی مسیر انتشار نسخه.',
  },
  {
    title: 'مشاوره فنی و اجرایی',
    detail: 'تحلیل مسیر تحویل، کاهش ریسک عملیاتی و طراحی قراردادهای اجرایی.',
  },
];

export default function ServicesPage() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">خدمات</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          این صفحه نمای کلی خدمات اجرایی جعبه ابزار فارسی را ارائه می‌کند و بخشی از مسیر شفاف تحویل
          در محیط توسعه است.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سرفصل خدمات</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {serviceItems.map((item) => (
            <li
              key={item.title}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7"
            >
              <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
              <p className="mt-2">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
