import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';
import Card from '@/shared/ui/Card';

export const metadata = buildMetadata({
  title: 'نرخ ارز امروز - دلار، یورو، پوند، درهم',
  description: 'مشاهده آخرین نرخ ارزها به صورت لحظه‌ای. نرخ دلار، یورو، پوند انگلیس، درهم امارات و لیر ترکیه.',
  path: '/market/currency-rates',
  keywords: ['نرخ ارز', 'نرخ دلار', 'نرخ یورو', 'قیمت ارز', 'نرخ ارز امروز'],
});

export default function CurrencyRatesPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          نرخ ارز امروز
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          آخرین نرخ ارزها را به صورت لحظه‌ای مشاهده کنید. اطلاعات از منابع معتبر بین‌المللی دریافت می‌شود.
        </p>
      </section>

      <Card className="p-6">
        <div className="text-center space-y-4">
          <p className="text-[var(--text-secondary)]">
            برای مشاهده نرخ ارزهای لحظه‌ای به صفحه زیر مراجعه کنید:
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
          ارزهای پرکاربرد
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">💵</div>
            <div className="font-bold text-[var(--text-primary)]">دلار آمریکا</div>
            <div className="text-sm text-[var(--text-muted)]">USD</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">💶</div>
            <div className="font-bold text-[var(--text-primary)]">یورو</div>
            <div className="text-sm text-[var(--text-muted)]">EUR</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">💷</div>
            <div className="font-bold text-[var(--text-primary)]">پوند انگلیس</div>
            <div className="text-sm text-[var(--text-muted)]">GBP</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🇦🇪</div>
            <div className="font-bold text-[var(--text-primary)]">درهم امارات</div>
            <div className="text-sm text-[var(--text-muted)]">AED</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🇹🇷</div>
            <div className="font-bold text-[var(--text-primary)]">لیر ترکیه</div>
            <div className="text-sm text-[var(--text-muted)]">TRY</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">🇮🇷</div>
            <div className="font-bold text-[var(--text-primary)]">تومان ایران</div>
            <div className="text-sm text-[var(--text-muted)]">IRR</div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          ابزارهای مرتبط
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/tools/currency-converter" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="font-bold text-[var(--text-primary)]">مبدل ارز</div>
              <div className="text-sm text-[var(--text-muted)]">تبدیل ارز با نرخ لحظه‌ای</div>
            </Card>
          </Link>
          <Link href="/market" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="font-bold text-[var(--text-primary)]">داشبورد بازار</div>
              <div className="text-sm text-[var(--text-muted)]">نمای زنده از بازار</div>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
