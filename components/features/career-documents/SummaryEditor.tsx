'use client';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SummaryEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">خلاصه حرفه‌ای</h2>
      <p className="text-sm text-[var(--text-muted)]">خلاصه حرفه‌ای خود را در ۲-۳ جمله بنویسید</p>
      <div className="space-y-2">
        <textarea
          id="career-summary"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="متخصص توسعه وب با بیش از ۵ سال تجربه در طراحی و پیاده‌سازی راهکارهای دیجیتال..."
          rows={6}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-none"
        />
        <div className="flex justify-end">
          <span className="text-xs text-[var(--text-muted)]">{value.length} کاراکتر</span>
        </div>
      </div>
    </div>
  );
}
