'use client';

type Props = {
  recipient: string;
  company: string;
  position: string;
  body: string;
  errors: string[];
  onChange: (fields: {
    recipient: string;
    company: string;
    position: string;
    body: string;
  }) => void;
};

export default function CoverLetterEditor({
  recipient,
  company,
  position,
  body,
  errors,
  onChange,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات کاورلتر</h2>

      {errors.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-[var(--color-danger)]" role="alert">
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="cl-recipient"
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            نام گیرنده
          </label>
          <input
            id="cl-recipient"
            type="text"
            value={recipient}
            onChange={(e) => onChange({ recipient: e.target.value, company, position, body })}
            placeholder="جناب آقای / سرکار خانم..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="cl-company"
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            نام شرکت
          </label>
          <input
            id="cl-company"
            type="text"
            value={company}
            onChange={(e) => onChange({ recipient, company: e.target.value, position, body })}
            placeholder="نام شرکت مقصد"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="cl-position"
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          عنوان شغلی درخواستی
        </label>
        <input
          id="cl-position"
          type="text"
          value={position}
          onChange={(e) => onChange({ recipient, company, position: e.target.value, body })}
          placeholder="مثلاً: توسعه‌دهنده فرانت‌اند"
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cl-body" className="block text-sm font-medium text-[var(--text-primary)]">
          متن نامه *
        </label>
        <textarea
          id="cl-body"
          value={body}
          onChange={(e) => onChange({ recipient, company, position, body: e.target.value })}
          placeholder="متن کاورلتر خود را اینجا بنویسید..."
          rows={10}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-none"
        />
        <div className="flex justify-end">
          <span className="text-xs text-[var(--text-muted)]">{body.length} کاراکتر</span>
        </div>
      </div>
    </div>
  );
}
