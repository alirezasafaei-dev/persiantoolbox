'use client';

import type { PaymentEntry } from './account-utils';
import { formatDate } from './account-utils';

interface PaymentHistoryTableProps {
  paymentHistory: PaymentEntry[];
  paymentHistoryLoading: boolean;
}

function getStatusColor(status: string): string {
  if (status === 'completed' || status === 'paid') {
    return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
  }
  if (status === 'failed' || status === 'cancelled') {
    return 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]';
  }
  return 'bg-[var(--color-warning, #f59e0b)]/10 text-[var(--color-warning, #f59e0b)]';
}

function getStatusLabel(status: string): string {
  if (status === 'completed' || status === 'paid') {
    return 'موفق';
  }
  if (status === 'failed') {
    return 'ناموفق';
  }
  if (status === 'cancelled') {
    return 'لغو شده';
  }
  return 'در انتظار';
}

export default function PaymentHistoryTable({
  paymentHistory,
  paymentHistoryLoading,
}: PaymentHistoryTableProps) {
  if (paymentHistoryLoading) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تاریخچه پرداخت‌ها</h3>
        <div className="text-sm text-[var(--text-muted)] py-4 text-center">در حال بارگذاری...</div>
      </section>
    );
  }

  if (paymentHistory.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تاریخچه پرداخت‌ها</h3>
        <div className="text-sm text-[var(--text-muted)] py-4 text-center">
          هنوز پرداختی ثبت نشده است.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تاریخچه پرداخت‌ها</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-light)]">
              <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                تاریخ
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                مبلغ
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                روش
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                وضعیت
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((payment) => (
              <tr key={payment.id} className="border-b border-[var(--border-light)] last:border-0">
                <td className="py-2 px-3 text-[var(--text-primary)]">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="py-2 px-3 text-[var(--text-primary)] font-semibold">
                  {payment.amount.toLocaleString('fa-IR')} تومان
                </td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">{payment.method}</td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${getStatusColor(payment.status)}`}
                  >
                    {getStatusLabel(payment.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
