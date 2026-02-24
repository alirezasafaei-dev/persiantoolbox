import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'مطالعات موردی - جعبه ابزار فارسی',
  description: 'مطالعات موردی کوتاه از خروجی‌های اجرایی و شواهد تحویل پروژه',
  path: '/case-studies',
});

const cases = [
  {
    title: 'بهبود پایداری مسیر انتشار',
    result: 'همگام‌سازی gateهای انتشار و قراردادهای کیفیت در چرخه توسعه.',
  },
  {
    title: 'تکمیل بسته شواهد Stage A/B/S/L',
    result: 'ثبت مستندات اجرایی و شواهد قابل ردیابی در runtime.',
  },
  {
    title: 'استانداردسازی مدارک فروش و تحویل',
    result: 'تعریف تمپلیت‌های Proposal، SOW و Change Request برای استفاده تیم.',
  },
];

export default function CaseStudiesPage() {
  return (
    <SiteShell containerClassName="py-10 space-y-8">
      <header className="section-surface p-6 md:p-8 space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">مطالعات موردی</h1>
        <p className="text-[var(--text-secondary)] leading-7">
          این صفحه نمونه خروجی‌های اجرایی را نمایش می‌دهد تا مسیر تحویل و شواهد برای تیم شفاف باقی
          بماند.
        </p>
      </header>

      <section className="section-surface p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">نمونه موارد</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {cases.map((item) => (
            <li
              key={item.title}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] leading-7"
            >
              <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
              <p className="mt-2">{item.result}</p>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
