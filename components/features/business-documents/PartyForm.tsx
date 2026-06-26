'use client';

import type { BusinessParty } from '@/lib/business-documents/types';
import Input from '@/shared/ui/Input';

type Props = {
  label: string;
  party: BusinessParty;
  errors: string[];
  onChange: (party: BusinessParty) => void;
};

export default function PartyForm({ label, party, errors, onChange }: Props) {
  const update = (field: keyof BusinessParty, value: string) => {
    onChange({ ...party, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
        {label}
      </h3>

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
        <Input
          id={`${label}-name`}
          label="نام *"
          value={party.name ?? ''}
          onChange={(e) => update('name', e.target.value)}
          placeholder="نام کامل"
        />
        <Input
          id={`${label}-nationalId`}
          label="کد ملی"
          value={party.nationalId ?? ''}
          onChange={(e) => update('nationalId', e.target.value)}
          placeholder="۱۰ رقم"
          maxLength={10}
        />
        <Input
          id={`${label}-registrationNo`}
          label="شماره ثبت"
          value={party.registrationNo ?? ''}
          onChange={(e) => update('registrationNo', e.target.value)}
          placeholder="شماره ثبت شرکت"
        />
        <Input
          id={`${label}-economicCode`}
          label="کد اقتصادی"
          value={party.economicCode ?? ''}
          onChange={(e) => update('economicCode', e.target.value)}
          placeholder="کد اقتصادی"
        />
        <Input
          id={`${label}-phone`}
          label="تلفن"
          value={party.phone ?? ''}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="۰۲۱۱۲۳۴۵۶۷۸۹"
          dir="ltr"
        />
        <Input
          id={`${label}-email`}
          label="ایمیل"
          value={party.email ?? ''}
          onChange={(e) => update('email', e.target.value)}
          placeholder="email@example.com"
          dir="ltr"
          type="email"
        />
      </div>
      <div className="grid gap-4">
        <Input
          id={`${label}-address`}
          label="آدرس"
          value={party.address ?? ''}
          onChange={(e) => update('address', e.target.value)}
          placeholder="آدرس کامل"
        />
      </div>
    </div>
  );
}
