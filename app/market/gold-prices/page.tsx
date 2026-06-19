import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';
import Card from '@/shared/ui/Card';

export const metadata = buildMetadata({
  title: 'قیمت طلا امروز - طلای ۱۸ عیار، سکه، مثقال',
  description: 'مشاهده آخرین قیمت طلا و سکه به صورت لحظه‌ای. قیمت طلای ۱۸ عیار، سکه تمام بهار آزادی و مثقال طلا.',
  path: '/market/gold-prices',
  keywords: ['قیمت طلا', 'طلای ۱۸ عیار', 'قیمت سکه', 'مثقال طلا', 'نرخ طلا'],
});

export default function GoldPricesPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          قیمت طلا امروز
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          آخرین قیمت طلا و سکه را به صورت لحظه‌ای مشاهده کنید. اطلاعات از منابع معتبر داخلی دریافت می‌شود.
        </p>
      </section>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-[var(--text-secondary)]">
            برای مشاهده قیمت طلای لحظه‌ای به صفحه زیر مراجعه کنید:
          </p>
          <Link
            href="/market"
            className="inline-block px-6 py-3 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded-lg hover:opacity-90 transition-opacity"
          >
            مشاهده داشبورد بازار
          </Link>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          انواع طلا
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🥇</div>
            <div className="font-bold text-[var(--text-primary)]">طلای ۱۸ عیار</div>
            <div className="text-sm text-[var(--text-muted)]">پرکاربردترین نوع طلا</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🪙</div>
            <div className="font-bold text-[var(--text-primary)]">سکه تمام بهار</div>
            <div className="text-sm text-[var(--text-muted)]">سکه رسمی ایران</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="font-bold text-[var(--text-primary)]">مثقال طلا</div>
            <div className="text-sm text-[var(--text-muted)]">واحد اندازه‌گیری طلا</div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          ابزارهای مرتبط
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/market" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="font-bold text-[var(--text-primary)]">داشبورد بازار</div>
              <div className="text-sm text-[var(--text-muted)]">نمای زنده از بازار</div>
            </Card>
          </Link>
          <Link href="/tools/investment-calculator" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="font-bold text-[var(--text-primary)]">ماشین‌حساب سرمایه‌گذاری</div>
              <div className="text-sm text-[var(--text-muted)]">محاسبه بازده سرمایه‌گذاری</div>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
