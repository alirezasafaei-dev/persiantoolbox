import Link from 'next/link';
import type { FinanceToolId } from '@/shared/analytics/financeSaved';

type Props = {
  current: FinanceToolId | 'hub';
};

const items: Array<{ id: FinanceToolId; label: string; href: string }> = [
  { id: 'loan', label: 'محاسبه‌گر وام', href: '/loan' },
  { id: 'salary', label: 'محاسبه‌گر حقوق', href: '/salary' },
  { id: 'interest', label: 'محاسبه‌گر سود بانکی', href: '/interest' },
];

export default function RelatedFinanceTools({ current }: Props) {
  const filtered = items.filter((item) => item.id !== current);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">ابزارهای مرتبط مالی</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]"
          >
            {item.label}
          </Link>
        ))}
        {current !== 'hub' && (
          <Link
            href="/tools"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]"
          >
            هاب مالی
          </Link>
        )}
      </div>
    </section>
  );
}
