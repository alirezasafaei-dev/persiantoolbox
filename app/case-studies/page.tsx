import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'مطالعات موردی PersianToolbox - جعبه ابزار فارسی',
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
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">مطالعات موردی</h1>
            <p className="text-[var(--text-secondary)] leading-7">
              این صفحه نمونه خروجی‌های اجرایی را نمایش می‌دهد تا مسیر تحویل و شواهد برای تیم شفاف
              باقی بماند.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">نمونه موارد</h2>
            <ul className="list-disc space-y-2 pr-5 text-[var(--text-secondary)]">
              {cases.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold text-[var(--text-primary)]">{item.title}: </span>
                  {item.result}
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
