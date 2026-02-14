import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'خدمات PersianToolbox - جعبه ابزار فارسی',
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
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">خدمات</h1>
            <p className="text-[var(--text-secondary)] leading-7">
              این صفحه نمای کلی خدمات اجرایی PersianToolbox را ارائه می‌کند و بخشی از مسیر شفاف
              تحویل در محیط توسعه است.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">سرفصل خدمات</h2>
            <ul className="list-disc space-y-2 pr-5 text-[var(--text-secondary)]">
              {serviceItems.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold text-[var(--text-primary)]">{item.title}: </span>
                  {item.detail}
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
