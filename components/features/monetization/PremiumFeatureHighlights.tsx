'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

const features = [
  {
    title: 'ذخیره سناریوها',
    description: 'سناریوهای مالی خود را ذخیره و مقایسه کنید',
    icon: '📊',
    href: '/dashboard/financial',
  },
  {
    title: 'گزارش PDF',
    description: 'گزارش‌های حرفه‌ای و قابل چاپ بسازید',
    icon: '📄',
    href: '/tools/report-generator',
  },
  {
    title: 'فاکتور آنلاین',
    description: 'فاکتور و صورتحساب حرفه‌ای بسازید',
    icon: '🧾',
    href: '/tools/invoice-generator',
  },
];

export default function PremiumFeatureHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <Link key={feature.href} href={feature.href}>
          <Card className="p-5 hover:border-[var(--color-primary)] transition-colors cursor-pointer">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="text-sm font-bold text-[var(--text-primary)]">{feature.title}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{feature.description}</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
