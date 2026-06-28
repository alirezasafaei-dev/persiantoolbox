'use client';

import type { PaymentEntry } from './account-utils';
import { formatDate } from './account-utils';

interface PaymentHistoryTableProps {
  paymentHistory: PaymentEntry[];
  paymentHistoryLoading: boolean;
}

export default function PaymentHistoryTable({
  paymentHistory,
  paymentHistoryLoading,
}: PaymentHistoryTableProps) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تاریخچه پرداخت‌ها</h3>
      {paymentHistoryLoading ? (
        <div className="text-sm text-[var(--text-muted)] py-4 text-center">در حال بارگذاری...</div>
      ) : paymentHistory.length === 0 ? (
        <div className="text-sm text-[var(--text-muted)] py-4 text-center">
          هنوز پرداختی ثبت نشده است.
        </div>
      ) : (
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
                <tr
                  key={payment.id}
                  className="border-b border-[var(--border-light)] last:border-0"
                >
                  <td className="py-2 px-3 text-[var(--text-primary)]">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="py-2 px-3 text-[var(--text-primary)] font-semibold">
                    {payment.amount.toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">{payment.method}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        payment.status === 'completed' || payment.status === 'paid'
                          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                          : payment.status === 'failed' || payment.status === 'cancelled'
                            ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                            : 'bg-[var(--color-warning, #f59e0b)]/10 text-[var(--color-warning, #f59e0b)]'
                      }`}
                    >
                      {payment.status === 'completed' || payment.status === 'paid'
                        ? 'موفق'
                        : payment.status === 'failed'
                          ? 'ناموفق'
                          : payment.status === 'cancelled'
                            ? 'لغو شده'
                            : 'در انتظار'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
