type Props = {
  compact?: boolean;
};

export default function FinanceTrustBlock({ compact = false }: Props) {
  return (
    <section
      className={`rounded-[var(--radius-lg)] border border-[rgb(var(--color-success-rgb)/0.32)] bg-[rgb(var(--color-success-rgb)/0.1)] ${compact ? 'p-4' : 'p-6'} space-y-3`}
    >
      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-[var(--text-primary)]`}>
        شفافیت و اعتماد در محاسبات مالی
      </h3>
      <ul className="list-disc space-y-2 pr-5 text-sm leading-6 text-[var(--text-secondary)]">
        <li>تمام محاسبات مالی به‌صورت محلی در مرورگر شما انجام می‌شود.</li>
        <li>هیچ اسکریپت شخص ثالث یا API خارجی برای خروجی مالی استفاده نمی‌شود.</li>
        <li>نمایش تمام مقادیر مالی در رابط کاربری با واحد تومان است.</li>
      </ul>
    </section>
  );
}
