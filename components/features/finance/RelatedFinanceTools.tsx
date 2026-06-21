import Link from 'next/link';

type Props = {
  current: string;
};

const items = [
  { id: 'loan', label: 'محاسبه‌گر وام', href: '/loan' },
  { id: 'salary', label: 'محاسبه‌گر حقوق', href: '/salary' },
  { id: 'interest', label: 'سود بانکی', href: '/interest' },
  { id: 'tax-calculator', label: 'مالیات', href: '/tools/tax-calculator' },
  { id: 'insurance-calculator', label: 'بیمه', href: '/tools/insurance-calculator' },
  { id: 'currency-converter', label: 'مبدل ارز', href: '/tools/currency-converter' },
  { id: 'inflation-calculator', label: 'تورم', href: '/tools/inflation-calculator' },
  { id: 'investment-calculator', label: 'سرمایه‌گذاری', href: '/tools/investment-calculator' },
  { id: 'bank-rate-comparator', label: 'مقایسه بانک', href: '/tools/bank-rate-comparator' },
  { id: 'overtime-calculator', label: 'اضافه‌کاری', href: '/tools/overtime-calculator' },
  { id: 'bonus-calculator', label: 'عیدانه', href: '/tools/bonus-calculator' },
  { id: 'severance-calculator', label: 'سنوات', href: '/tools/severance-calculator' },
];

export default function RelatedFinanceTools({ current }: Props) {
  const filtered = items.filter((item) => item.id !== current && item.href !== `/${current}`);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">ابزارهای مرتبط مالی</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-subtle)] transition-all"
          >
            {item.label}
          </Link>
        ))}
        {current !== 'hub' && (
          <Link
            href="/tools"
            className="rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)]/5 px-4 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
          >
            مشاهده همه ابزارهای مالی
          </Link>
        )}
      </div>
    </section>
  );
}
