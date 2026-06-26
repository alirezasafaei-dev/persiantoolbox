'use client';

import type { ContractField } from '@/lib/contract-tools/types';
import Input from '@/shared/ui/Input';

type Props = {
  fields: ContractField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
};

export default function ContractFormFields({ fields, values, errors, onChange }: Props) {
  const grouped = fields.reduce<Record<string, ContractField[]>>((acc, field) => {
    const group = acc[field.group];
    if (group) {
      group.push(field);
    } else {
      acc[field.group] = [field];
    }
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([groupKey, groupFields]) => {
        const groupLabel = groupFields[0]?.groupLabel ?? groupKey;
        return (
          <div key={groupKey} className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              {groupLabel}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {groupFields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label
                    htmlFor={field.id}
                    className="block text-xs font-semibold text-[var(--text-secondary)] mb-1"
                  >
                    {field.label}
                    {field.required && <span className="text-[var(--color-danger)] mr-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      value={values[field.id] ?? ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className={
                        'w-full rounded-[var(--radius-md)] border bg-[var(--surface-1)] ' +
                        'px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none ' +
                        `focus:ring-2 focus:ring-[var(--color-primary)]/50 ${
                          errors[field.id]
                            ? 'border-[var(--color-danger)]'
                            : 'border-[var(--border-light)]'
                        }`
                      }
                      aria-invalid={!!errors[field.id]}
                      aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.id}
                      value={values[field.id] ?? ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className={
                        'w-full rounded-[var(--radius-md)] border bg-[var(--surface-1)] ' +
                        'px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none ' +
                        `focus:ring-2 focus:ring-[var(--color-primary)]/50 ${
                          errors[field.id]
                            ? 'border-[var(--color-danger)]'
                            : 'border-[var(--border-light)]'
                        }`
                      }
                      aria-invalid={!!errors[field.id]}
                    >
                      <option value="">انتخاب کنید...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={values[field.id] ?? ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      {...(errors[field.id] ? { error: errors[field.id] } : {})}
                    />
                  )}
                  {errors[field.id] && (
                    <p
                      id={`${field.id}-error`}
                      className="mt-1 text-xs text-[var(--color-danger)]"
                      role="alert"
                    >
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
